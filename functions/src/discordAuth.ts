import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios, { AxiosResponse } from "axios";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { Dj } from "../../webapp/src/util/types";

interface DiscordTokenResponse {
    access_token: string;
}

interface DiscordUserResponse {
    id: string;
    global_name?: string;
    username: string;
    avatar?: string;
    banner?: string;
}

interface DiscordGuildMemberResponse {
    nick?: string;
    avatar?: string;
    banner?: string;
    user: DiscordUserResponse;
}

const discord_client_secret = defineSecret("DISCORD_CLIENT_SECRET");


const db_auth = admin.firestore();
db_auth.settings({ ignoreUndefinedProperties: true });

export const discordAuth = onRequest(
    { cors: true, secrets: ["DISCORD_CLIENT_SECRET"] },
    async (req: functions.Request, res: functions.Response) => {
        res.set("Access-Control-Allow-Credentials", "true");

        const { code, redirect_uri } = req.body;

        if (!code) {
            res.status(403).send({ error: "Authorization code is required" });
            return;
        }
        if (!redirect_uri) {
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
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }

            res.status(403).send({ error: `${error}` });
            return;
        }


        const { access_token } = tokenResponse.data;

        // Fetch the user's Discord profile information
        // const discordUser = await getDiscordUserInfo(access_token);
        const discordGuildMember = await getDiscordGuildInfo(access_token);

        await syncUserToFirestore(discordGuildMember);

        // Generate a custom Firebase token
        const firebaseToken = await admin.auth().createCustomToken(discordGuildMember.user.id);

        res.status(200).send({
            firebase_token: firebaseToken,
            discord_user: discordGuildMember,
        });
        return;
    });

// /**
//  * Fetches the Discord user's profile information using the provided access token.
//  *
//  * @param {string} access_token - The access token for authenticating the request.
//  * @return {Promise<DiscordUserResponse>} - A promise that resolves to the user's Discord profile information.
//  */
// async function getDiscordUserInfo(access_token: string): Promise<DiscordUserResponse> {
//     // Fetch the user's Discord profile information
//     return await discordApiRequest("/users/@me", access_token);
// }

/**
 * Fetches the Discord user's guild member information using the provided access token and user ID.
 *
 * @param {string} access_token - The access token for authenticating the request.
 * @param {string} discord_user_id - The Discord user ID for identifying the guild member.
 * @return {Promise<DiscordUserResponse>} - A promise that resolves to the user's guild member information.
 */
async function getDiscordGuildInfo(access_token: string): Promise<DiscordGuildMemberResponse> {
    // Fetch the user's Discord profile information
    const guildId = "1004489038159413248";
    const url = `/users/@me/guilds/${guildId}/member`;
    return await discordApiRequest(url, access_token) as unknown as DiscordGuildMemberResponse;
}

/**
 * Makes a request to the Discord API and returns the response data.
 *
 * @template T - The expected response type, constrained to DiscordUserResponse.
 * @param {string} url - The API endpoint URL.
 * @param {string} access_token - The access token for authentication.
 * @return {Promise<T>} - A promise that resolves to the response data.
 */
async function discordApiRequest<T extends DiscordUserResponse>(url: string, access_token: string): Promise<T> {
    const baseUrl = "https://discord.com/api";
    const fullUrl = baseUrl + url;
    const response = await axios.get<T>(
        fullUrl,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );
    return response.data;
}

/**
 * Synchronizes a Discord user's information to Firestore.
 *
 * @param {DiscordUserResponse} discordUser - The Discord user's profile information.
 * @return {Promise<void>} - A promise that resolves when the user data is saved or updated in Firestore.
 */
async function syncUserToFirestore(discordUser: DiscordGuildMemberResponse) {
    const defaultDjRecord: Dj = {
        discord_id: discordUser.user.id,
        discord: {
            ...discordUser,
        },
        public_name: discordUser.nick || discordUser.user.global_name || discordUser.user.username || "Unknown User",
        dj_name: discordUser.nick || discordUser.user.global_name || discordUser.user.username || "Unknown User",
        roles: [{ role: "dj" }], // Default role for new users, can be updated later
    };


    // Attempt to fetch an existing DJ from the "djs" Firestore collection
    const djDoc = (
        await db_auth.collection("djs").where("discord_id", "==", discordUser.user.id).get()
    ).docs[0];

    // Merge existing DJ data with the new data if the DJ document exists
    if (!djDoc) {
        // If no existing DJ document is found, create a new one
        await db_auth.collection("djs").add(defaultDjRecord);
    }

    // Update the default dj doc with existing data if the DJ document exists
    djDoc && await db_auth.collection("djs").doc(djDoc.id).set({
        ...djDoc.data(),
        ...defaultDjRecord,
        roles: djDoc.data().roles || [{ role: "dj" }], // Ensure roles are preserved
    });


    // // Save or update the DJ document in the "djs" Firestore collection
    // return await admin.firestore().collection("djs").doc(djDoc.id).set(defaultDjRecord, { merge: true });
}
