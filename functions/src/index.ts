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

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();

export const whiteboard = onRequest(async (request, response) => {
  const docRef = await getFirestore().collection("whiteboards").doc("current")
  const document = await docRef.get();
  const whiteboard = document.data();

  const key = request.query.path?.toString() ?? null;

  let responseText;
  if(key) {
    responseText = whiteboard[key]?.toString();
    if(!responseText)
      response.statusCode = 500;
      response.statusMessage = "Key not found. UwU";
    
  } else {
    responseText = JSON.stringify(whiteboard);
  }

  logger.info("Request from ", { structuredData: true });
  response.send(responseText);
});
