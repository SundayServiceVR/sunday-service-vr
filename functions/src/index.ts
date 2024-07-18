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
import { initializeApp as initFirebaseApp } from "firebase/app";
import express, { Express } from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import expressSession from "express-session";

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
