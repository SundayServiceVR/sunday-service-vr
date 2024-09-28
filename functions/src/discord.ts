import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

const fetchUser = async (discordId: string, discordApiKey: string) => {
    const url = `https://discord.com/api/v9/users/${discordId}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bot ${discordApiKey}`,
        },
    });

    if (!response.ok && response.status !== 404) throw new Error(`Error status code: ${response.status}`);

    return {
        data: await response.json(),
        discordResponse: response,
    };
};

/**
 * Experimental endpoint that can convert to arbitrary timezones
 */
export const getDiscordUserInfo = onRequest({ secrets: ["DISCORD_API_KEY"] }, async (request, response) => {
    const discordApiKey = defineSecret("DISCORD_API_KEY").value();
    const { discordId } = request.query;
    const userId = discordId?.toString();
    const { data } = await fetchUser(userId ?? "", discordApiKey);
    response.json(data);
});
