/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { existsSync, readFileSync } from "fs";

const LOCAL_ADMIN_KEY_PATH = "./local_admin_key.json";


// TODO: This works in production because we manually deploy the functions, which also
// uploads our local admin key.  The key is gitignored, so when it's absent (CI, fresh
// clones) fall back to default credentials, which is fine for the emulators.
const credential = existsSync(LOCAL_ADMIN_KEY_PATH) ?
    admin.credential.cert(getLocalAdminKey()) :
    undefined;

initializeApp({
    ...(credential ? { credential } : {}),
    projectId: process.env.GCLOUD_PROJECT ?? "sunday-service-vr",
});

/**
 * Reads and parses the local admin key JSON file.
 * This is used for local development when the emulator is running.
 *
 * @return {object} The parsed local admin key.
 */
function getLocalAdminKey() {
    const result = JSON.parse(readFileSync(LOCAL_ADMIN_KEY_PATH, "utf-8"));
    return result;
}

export * from "./sheetsBackup";
export * from "./whiteboard";
export * from "./discordAuth";
export * from "./eventSignup";
export * from "./eventSignup/eventSignupGetEventAndDj";
