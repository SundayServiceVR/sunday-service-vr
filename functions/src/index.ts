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
import { initializeApp as initFirebaseApp } from "firebase/app";
import express, { Express } from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import expressSession from "express-session";

import * as logger from "firebase-functions/logger";

import { getLineupText, timeFormats } from "../util/messageWriters";

import { getNextEvent } from "../util/events";

// YOUR FIREBASE CONFIG OBJECT GOES HERE
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

initFirebaseApp(firebaseConfig);
initializeApp();

// Need to import these below the initialization because firebase said so~
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
require("./services/discordOauth");

const app: Express = express();

// COOKIE PARSER AND EXPRESS SESSION ARE NEEDED
// TO MAINTAIN THE USER'S SESSION ACROSS REQUESTS
// SEND A PR IF YOU FIND WAYS TO IMPROVE THIS SYSTEM

app.use(cookieParser());
app.use(
    expressSession({
        secret: process.env.SECRET_COOKIE_KEY ??
            "oops I fucked up and forgot to set an env",
        resave: true,
        saveUninitialized: true,
    })
);

// INITIALIZES PASSPORT. OAUTH2 WILL NOT WORK WITHOUT THESE 2 LINES
app.use(passport.initialize());
app.use(passport.session());

// MAKES OUR EXPRESS APP USE THE ROUTES DEFINED IN THE BELOW FILES
app.use("/", authRoutes);
app.use("/", userRoutes);

// EXPORT OUR FIREBASE FUNCTIONS
exports.api = onRequest(app);

const PLACEHOLDER_TEXT = `Sunday Service

Every Sunday

Noon - 5pm-ish PST/PDT
8pm - 1am-ish BST/BDT`;

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

export const nextEventWhiteboard = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });


    const event = await getNextEvent();

    const result = {
        "GMT": event ? getLineupText(event, timeFormats.GMT) : PLACEHOLDER_TEXT,
        "AU": event ? getLineupText(event, timeFormats.AU) : PLACEHOLDER_TEXT,
    };

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
