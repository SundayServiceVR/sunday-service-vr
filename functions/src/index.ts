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
import { Timestamp, getFirestore } from "firebase-admin/firestore";

import * as logger from "firebase-functions/logger";

import { getLineupText, timeFormats } from "../util/messageWriters";

import { docToEvent } from "../util/converters";


initializeApp();

export const whiteboard = onRequest(async (request, response) => {
    const docRef = await getFirestore()
        .collection("whiteboards")
        .doc("current");
    const document = await docRef.get();
    const whiteboard = document.data();

    const responseText = JSON.stringify(whiteboard);

    logger.info("Request from ", { structuredData: true });
    response.send(responseText);
});

export const nextEventWhiteboard = onRequest(async (request, response) => {
    logger.info("Request from ", { structuredData: true });
    const docRef = await getFirestore()
        .collection("events")
        .where("end_datetime", ">", Timestamp.now())
        .orderBy("start_datetime", "asc");

    const snapshot = await docRef.get();

    const eventDoc = snapshot.docs[0]?.data();
    const event = docToEvent(eventDoc);

    logger.info(event);

    const result = {
        "gmt": "Stay Tuned!",
        "au": "Stay Tuned!",
        "event": null as null | string,
    };

    if (event) {
        result["gmt"] = getLineupText(event, timeFormats.GMT);
        result["au"] = getLineupText(event, timeFormats.AU);
        result["event"] = JSON.stringify(event);
    }

    response.send(JSON.stringify(result));
});


