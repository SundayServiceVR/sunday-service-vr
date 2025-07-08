import * as admin from "firebase-admin";
import axios, { AxiosResponse } from "axios";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { AppUserRole, Dj } from "../../webapp/src/util/types";
import { getRolesFromDiscordRoles } from "./lib/rolesMap";
import { APIGuildMember } from "discord-api-types/v10";

interface DiscordTokenResponse {
    access_token: string;
}

const discord_client_secret = defineSecret("DISCORD_CLIENT_SECRET");


const db_auth = admin.firestore();
db_auth.settings({ ignoreUndefinedProperties: true });

export const discordAuth = onRequest(
    { cors: true, secrets: ["DISCORD_CLIENT_SECRET"] },
    async (req, res) => {
        try {
            res.set("Access-Control-Allow-Credentials", "true");

            const { code, redirect_uri } = req.body;

            if (!code) {
                console.error("DISCORD_AUTH_FAILED: Missing authorization code", {
                    hasBody: !!req.body,
                    bodyKeys: req.body ? Object.keys(req.body) : [],
                });
                res.status(403).send({ error: "Authorization code is required" });
                return;
            }
            if (!redirect_uri) {
                console.error("DISCORD_AUTH_FAILED: Missing redirect URI", {
                    hasCode: !!code,
                    redirectUri: redirect_uri,
                });
                res.status(400).send({ error: "Redirect URI is required" });
                return;
            }

            const client_id = "1225554722916663376";
            const client_secret = discord_client_secret.value();
            const grant_type = "authorization_code";

            let tokenResponse: AxiosResponse<DiscordTokenResponse>;

            try {
                // Exchange the authorization code for an access token
                tokenResponse = await axios.post<DiscordTokenResponse>(
                    "https://discord.com/api/oauth2/token",
                    new URLSearchParams({
                        client_id,
                        client_secret,
                        grant_type,
                        code,
                        redirect_uri,
                    })
                );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("DISCORD_TOKEN_EXCHANGE_FAILED", {
                    status: error.response?.status,
                    error: error.response?.data?.error || error.message,
                    errorDescription: error.response?.data?.error_description,
                    redirectUri: redirect_uri,
                });

                res.status(403).send({ error: `${error}` });
                return;
            }

            const { access_token } = tokenResponse.data;

            // Fetch the user's Discord profile information
            // const discordUser = await getDiscordUserInfo(access_token);
            const discordGuildMember = await getDiscordGuildMember(access_token);

            const { djDocId, syncedDjData: synced_dj_data } = await syncUserToFirestore(discordGuildMember);

            // Generate a custom Firebase token
            const roles = synced_dj_data.roles?.map((role: AppUserRole) => role.role) || []; // Default to "dj" if no roles are found
            const firebaseToken = await admin.auth().createCustomToken(djDocId, { roles, discord_id: synced_dj_data.discord_id });

            // Log successful authentication with Discord ID only
            console.log("DISCORD_AUTH_SUCCESS", {
                discordId: synced_dj_data.discord_id,
            });

            res.status(200).send({
                firebase_token: firebaseToken,
                synced_dj_data,
            });
            return;
        } catch (error) {
            console.error("DISCORD_AUTH_UNEXPECTED_ERROR", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            res.status(500).send({ error: "Internal server error" });
            return;
        }
    });

/**
 * Fetches the Discord user's guild member information using the provided access token and user ID.
 *
 * @param {string} access_token - The access token for authenticating the request.
 * @param {string} discord_user_id - The Discord user ID for identifying the guild member.
 * @return {Promise<APIGuildMember>} - A promise that resolves to the user's guild member information.
 */
async function getDiscordGuildMember(access_token: string): Promise<APIGuildMember> {
    // Fetch the user's Discord profile information
    const guildId = "1004489038159413248";
    const url = `/users/@me/guilds/${guildId}/member`;

    try {
        const result = await discordApiRequest(url, access_token) as unknown as APIGuildMember;
        return result;
    } catch (error) {
        console.error("DISCORD_GUILD_MEMBER_FETCH_FAILED", {
            error: error instanceof Error ? error.message : String(error),
            guildId,
            endpoint: url,
        });
        throw error;
    }
}

/**
 * Makes a request to the Discord API and returns the response data.
 *
 * @template T - The expected response type, constrained to DiscordUserResponse.
 * @param {string} url - The API endpoint URL.
 * @param {string} access_token - The access token for authentication.
 * @return {Promise<T>} - A promise that resolves to the response data.
 */
async function discordApiRequest<T extends APIGuildMember>(url: string, access_token: string): Promise<T> {
    const baseUrl = "https://discord.com/api";
    const fullUrl = baseUrl + url;

    try {
        const response = await axios.get<T>(
            fullUrl,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        console.error("DISCORD_API_REQUEST_FAILED", {
            url: fullUrl,
            status: axiosError.response?.status,
            error: axiosError.response?.data?.message || axiosError.message,
            code: axiosError.response?.data?.code,
        });
        throw error;
    }
}

/**
 * Synchronizes a Discord user's information to Firestore.
 *
 * @param {APIGuildMember} discordUser - The Discord user's profile information.
 * @return {Promise<void>} - A promise that resolves when the user data is saved or updated in Firestore.
 */
async function syncUserToFirestore(discordUser: APIGuildMember) {
    const avatar = `https://cdn.discordapp.com/avatars/${discordUser.user.id}/${discordUser.avatar ?? discordUser.user.avatar}.png`;

    const defaultDjRecord: Dj = {
        discord_id: discordUser.user.id,
        public_name: discordUser.nick || discordUser.user.global_name || discordUser.user.username || "Unknown User",
        avatar,
        dj_name: discordUser.nick || discordUser.user.global_name || discordUser.user.username || "Unknown User",
        roles: [{ role: "dj" }], // Default role for new users, can be updated later
    };

    let djDocId: string;

    try {
        // Attempt to fetch an existing DJ from the "djs" Firestore collection
        const djDoc = (
            await db_auth.collection("djs").where("discord_id", "==", discordUser.user.id).get()
        ).docs[0];
        djDocId = djDoc?.id;

        // Merge existing DJ data with the new data if the DJ document exists
        if (!djDoc) {
            // If no existing DJ document is found, create a new one
            const newDjDoc = await db_auth.collection("djs").add(defaultDjRecord);
            djDocId = newDjDoc.id;
        }

        // Sync the roles from Discord to Firestore
        const roles = getRolesFromDiscordRoles(discordUser.roles);

        const syncedDjData: Dj = {
            ...defaultDjRecord,
            ...djDoc?.data() ?? {}, // Overlay existing data on the default record
            avatar, // As long as we are tightly coupled to Discord, we will reset the avatar every time.
            roles,
        };

        // Update the default dj doc with existing data if the DJ document exists
        await db_auth.collection("djs").doc(djDocId).set(syncedDjData);

        return { djDocId, syncedDjData };
    } catch (error) {
        console.error("FIRESTORE_SYNC_FAILED", {
            discordId: discordUser.user.id,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
