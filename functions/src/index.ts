/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
