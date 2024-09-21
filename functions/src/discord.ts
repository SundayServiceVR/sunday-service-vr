import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
// import { Client, GatewayIntentBits } from "discord.js";

// const fetch = require("node-fetch");

// You might want to store this in an environment variable or something
// const token = "YOUR_TOKEN";


const fetchUser = async (discordId: string) => {
    const discordApiKey = defineSecret("DISCORD_API_KEY").value();
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
export const getDiscordUserInfo = onRequest(async (request, response) => {
    const { discordId } = request.query;
    const userId = discordId?.toString();
    const { data } = await fetchUser(userId ?? "");
    response.json(data);
});
