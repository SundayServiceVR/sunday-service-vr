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
import { readFileSync } from "fs";


const credential =
    admin.credential.cert(
        // TODO: This works now because we are manually deploying the functions, which also
        // uploads our local admin key.  I think there's a different way to specify the
        // service account/ credentials when deploying to the emulator, but I don't know what it is.
        getLocalAdminKey()
    );

initializeApp({
    credential,
    projectId: "sunday-service-vr",
});

/**
 * Reads and parses the local admin key JSON file.
 * This is used for local development when the emulator is running.
 *
 * @return {object} The parsed local admin key.
 */
function getLocalAdminKey() {
    const result = JSON.parse(readFileSync("./local_admin_key.json", "utf-8"));
    return result;
}

export * from "./sheetsBackup";
export * from "./whiteboard";
export * from "./discordAuth";
export * from "./eventSignup";
export * from "./eventSignup/eventSignupGetEventAndDj";
