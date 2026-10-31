import * as logger from "firebase-functions/logger";
import { onRequest, Request } from "firebase-functions/v2/https";
import { getNextEvent } from "./events";
import { defineSecret } from "firebase-functions/params";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { Response } from "express";
import { docToEventRaw } from "../../../webapp/src/store/converters";
import corsOptions from "../eventSignup/corsOptions";
import { timeFormats, getLineupText, PLACEHOLDER_TEXT } from "./messageWriters";
import { pushEventToWhiteboard, clearWhiteboard as clearWhiteboardRepo } from "./whiteboardSync";

// Fine-grained GitHub PAT with "Contents: read and write" on SundayServiceVR/whiteboard.
// Set with: firebase functions:secrets:set GITHUB_WHITEBOARD_TOKEN
const githubWhiteboardToken = defineSecret("GITHUB_WHITEBOARD_TOKEN");

// Same roles that may write events (see firestore.rules).
const BOARD_EDITOR_ROLES = ["admin", "host"];

/**
 * Verifies the caller's Firebase ID token and role, sending the error response if not allowed.
 * @param {Request} request The request
 * @param {Response} response The response
 * @return {boolean} true if the caller may update the board
 */
async function requireBoardEditor(request: Request, response: Response): Promise<boolean> {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        response.status(401).send("Unauthorized");
        return false;
    }

    try {
        const decoded = await getAuth().verifyIdToken(authHeader.slice("Bearer ".length));
        const roles: unknown = decoded.roles;
        if (Array.isArray(roles) && roles.some((role) => BOARD_EDITOR_ROLES.includes(role))) {
            return true;
        }
    } catch {
        response.status(401).send("Invalid token");
        return false;
    }

    response.status(403).send("Forbidden");
    return false;
}

/**
 * Pushes the given event's lineup and posters to the whiteboard repo.
 * Called by the "Update board" button in the event preflight checklist.
 */
export const updateWhiteboard = onRequest({
    ...corsOptions,
    secrets: [githubWhiteboardToken],
    memory: "1GiB", // Image conversion of large posters
    timeoutSeconds: 120,
}, async (request, response) => {
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }

    if (!(await requireBoardEditor(request, response))) {
        return;
    }

    const eventId: unknown = request.body?.eventId;
    if (typeof eventId !== "string" || !eventId) {
        response.status(400).send("eventId is required");
        return;
    }

    try {
        const snapshot = await getFirestore().collection("events").doc(eventId).get();
        if (!snapshot.exists) {
            response.status(404).send("Event not found");
            return;
        }

        const event = { ...docToEventRaw(snapshot.data()), id: snapshot.id };
        response.send(await pushEventToWhiteboard(event, githubWhiteboardToken.value()));
    } catch (error) {
        logger.error("Failed to update whiteboard", error);
        response.status(500).send("Failed to update whiteboard");
    }
});

/**
 * Resets the whiteboard to placeholder text and default posters.
 * Called by the "Clear board" button in the event preflight checklist.
 */
export const clearWhiteboard = onRequest({
    ...corsOptions,
    secrets: [githubWhiteboardToken],
    memory: "1GiB", // Image conversion
    timeoutSeconds: 120,
}, async (request, response) => {
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }

    if (!(await requireBoardEditor(request, response))) {
        return;
    }

    try {
        response.send(await clearWhiteboardRepo(githubWhiteboardToken.value()));
    } catch (error) {
        logger.error("Failed to clear whiteboard", error);
        response.status(500).send("Failed to clear whiteboard");
    }
});

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
    response.send(JSON.stringify(await getNextEvent()));
});

/**
 * Returns just the lineup poster URL for the next event.
 * Useful for in-world whiteboards or OBS overlays that only need the image.
 */
export const nextEventLineupPoster = onRequest(async (request, response) => {
    logger.info(`Request from ${request.ip}`, { structuredData: true });

    const event = await getNextEvent();

    response.send(JSON.stringify({
        event_id: event?.id ?? null,
        lineup_poster_url: event?.lineup_poster_url ?? null,
    }));
});
