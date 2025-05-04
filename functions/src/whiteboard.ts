import { logger } from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v1/https";
import { getNextEvent } from "../util/events";
import { timeFormats, getLineupText } from "../util/messageWriters";

const PLACEHOLDER_TEXT = `Sunday Service

Every Sunday

Noon - 5pm-ish PST/PDT
8pm - 1am-ish BST/BDT`;

/**
 * Experimental endpoint that can convert to arbitrary timezones
 */
export const nextEventBoardAnyTz = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });

    const requestedTimezone = request.query["timezone"]?.toString().toUpperCase();

    if (!requestedTimezone || !Object.keys(timeFormats).includes(requestedTimezone)) {
        response.status(400).send(`Bad Query Parameter: timezone (Requested ${requestedTimezone})`);
        return;
    }

    const timeFormat = timeFormats[requestedTimezone];

    const event = await getNextEvent();

    const result = event ? getLineupText(event, timeFormat) : PLACEHOLDER_TEXT;

    response.send(result);
});

/**
 * Returns text for the in-world board
 */
export const nextEventWhiteboard = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });

    const event = await getNextEvent();

    const result = {
        "GMT": event ? getLineupText(event, timeFormats.GMT) : PLACEHOLDER_TEXT,
        "AU": event ? getLineupText(event, timeFormats.AU) : PLACEHOLDER_TEXT,
    };

    response.send(result);
});

/**
 * Returns data for other tools, like our OBS Scene Generator
 */
export const nextEvent = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });
    response.send(JSON.stringify(await getNextEvent(true)));
});
