/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import * as logger from "firebase-functions/logger";

import { getLineupText, timeFormats } from "../util/messageWriters";

import { getNextEvent } from "../util/events";

initializeApp();

export const nextEventBoardAnyTz = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });

    let requestedTimezone = request.query["timezone"]?.toString().toUpperCase();

    if(!requestedTimezone || !Object.keys(timeFormats).includes(requestedTimezone)) {
        response.status(400).send(`Bad Query Parameter: timezone (Requested ${requestedTimezone})`);
        return;
    };

    const timeFormat = timeFormats[requestedTimezone];

    const event = await getNextEvent();

    const result = event ? getLineupText(event, timeFormat) : "Stay Tuned!";

    response.send(result);
});

export const nextEventWhiteboard = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });


    const event = await getNextEvent();

    const result = {
        "GMT": event ? getLineupText(event, timeFormats.GMT) : "Stay Tuned!",
        "AU": event ? getLineupText(event, timeFormats.AU) : "Stay Tuned!",
    }

    response.send(result);
});


export const nextEvent = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });
    response.send(JSON.stringify(await getNextEvent()));
});

// Legacy Endpoint
export const whiteboard = onRequest(async (request, response) => {
    const docRef = await getFirestore()
        .collection("whiteboards")
        .doc("current");
    const document = await docRef.get();
    const whiteboard = document.data();

    const responseText = JSON.stringify(whiteboard);

    logger.info(`Request from ${request.ip}`, { structuredData: true });
    response.send(responseText);
});
