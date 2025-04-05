// import { logger } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { getFirestore, QuerySnapshot, Timestamp, DocumentReference } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import { Dj, Slot, Event } from "../../webapp/src/util/types";
import { logger } from "firebase-functions/v2";
import { getSignupForSlot } from "../../webapp/src/contexts/useEventDjCache/helpers";
import { fetchDjsMap } from "./lib/database";

const backupSheetId = process.env.FUNCTIONS_EMULATOR === "true" ?
    "11jLcYOy1YryYb8PIFpwAMzcO928nFYskKKmigMQcvj0": // Nonoprod
    "1k-WANG5zbwaLeEEMpGy81b0Itd-AWd03Lotdff9B2aQ"; // Prod

/**
 * Test endpoint for backing up the schedule
 */
export const backupData = onRequest({ secrets: ["BACKUPS_SERVICE_ACCOUNT_KEY"] }, async (request, response) => {
    await backupDataCommon();
    response.send("Done.");
});


/**
 * Scheduled task
 */
export const backupDataScheduled = onSchedule({
    schedule: "every tuesday 09:00",
    secrets: ["BACKUPS_SERVICE_ACCOUNT_KEY"],
}, async () => {
    await backupDataCommon();
});

/**
 * Common backupData entrypoint
 */
async function backupDataCommon() {
    const djQuerySnapshot = await getFirestore().collection("djs").get();
    if (djQuerySnapshot.size <= 0) {
        throw new Error("No DJs found, aborting backup.");
    }

    const eventQuerySnapshot = await getFirestore().collection("events").get();
    if (eventQuerySnapshot.size <= 0) {
        throw new Error("No Events found, aborting backup.");
    }

    logger.info(`Backing up ${djQuerySnapshot.size} Djs and ${eventQuerySnapshot.size} Events.`);

    const backupDoc = await getBackupDoc();

    await backupDjs(backupDoc, djQuerySnapshot);
    await backupEvents(backupDoc, eventQuerySnapshot);
    await backupGrid(backupDoc, djQuerySnapshot, eventQuerySnapshot);
}


/**
 * Returns the backup google doc
 *
 * @return {GoogleSpreadsheet} backupDoc
 */
async function getBackupDoc() {
    const serviceAccountKey = defineString("BACKUPS_SERVICE_ACCOUNT_KEY").value();
    const jwt = new JWT({
        email: "sheets-auto-backup@sunday-service-vr.iam.gserviceaccount.com",
        key: serviceAccountKey.split(String.raw`\n`).join("\n"),
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
        ],
    });

    const backupDoc = new GoogleSpreadsheet(backupSheetId, jwt);
    await backupDoc.loadInfo();

    return backupDoc;
}

/**
 * Backs up djs to the djs sheet
 *
 * @param {GoogleSpreadsheet} backupDoc adsdf
 * @param {QuerySnapshot} querySnapshot asdf
 */
async function backupDjs(backupDoc: GoogleSpreadsheet, querySnapshot: QuerySnapshot) {
    const DJ_BACKUP_HEADERS: (keyof Dj)[] = [
        "dj_name",
        "public_name",
        "discord_id",
        "twitch_username",
        "rtmp_url",
    ];

    const spreadsheet = backupDoc.sheetsById["350139617"];
    await spreadsheet.clear();
    await spreadsheet.setHeaderRow(["id", ...DJ_BACKUP_HEADERS]);

    await spreadsheet.addRows(querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })));
}

/**
 * Backs up events to the events sheet
 *
 * @param {GoogleSpreadsheet} backupDoc adsdf
 * @param {QuerySnapshot} querySnapshot asdf
 */
async function backupEvents(backupDoc: GoogleSpreadsheet, querySnapshot: QuerySnapshot) {
    const EVENT_BACKUP_HEADERS: (string)[] = [
        "name",
        "date",
        "host",
        "djs",
    ];

    const spreadsheet = backupDoc.sheetsById["1642276921"];
    await spreadsheet.clear();
    await spreadsheet.setHeaderRow(["id", ...EVENT_BACKUP_HEADERS]);

    const rows = querySnapshot.docs.map((doc) => {
        const rawEvent = doc.data();
        const event = rawEvent as Event;

        const getSlotInfo = async (slot: Slot, event: Event) => {
            const slotName = getSignupForSlot(event, slot)?.name ?? slot.dj_name;
            const signup = getSignupForSlot(event, slot);

            const adminDjCollection = await getFirestore().collection("djs");

            // Converts the normal DocumentReference to the firebase admin DocumentReference
            const djRefs: DocumentReference[] = (signup?.dj_refs?.map((ref) => {
                return adminDjCollection.doc(ref.id);
            }) ?? []);

            const eventDjMap = await fetchDjsMap(djRefs);

            const djNames = await djRefs?.map((ref) => {
                const dj = eventDjMap.get(ref.id) as Dj | undefined;
                return dj?.dj_name ?? `DJ Ref: ${ref.id}`;
            }) ?? [];

            return { slotName, djRefs, djNames };
        };

        const djs = event.slots.map(async (slot: Slot) => {
            const slotInfo = await getSlotInfo(slot, event);
            return slotInfo.djNames;
        }).join(", ");

        return {
            id: doc.id,
            rawDate: rawEvent.start_datetime,
            date: (rawEvent.start_datetime as Timestamp).toDate().toUTCString(),
            djs,
            ...rawEvent,
        };
    });

    await spreadsheet.addRows(rows.sort((a, b) => (a.rawDate - b.rawDate)));
}

/**
 * Backs up DJs to the dj sheet
 *
 * @param {GoogleSpreadsheet} backupDoc adsdf
 * @param {QuerySnapshot} djQerySnapshot asdf
 * @param {QuerySnapshot} eventQuerySnapshot asdf
 */
async function backupGrid(
    backupDoc: GoogleSpreadsheet,
    djQerySnapshot: QuerySnapshot,
    eventQuerySnapshot: QuerySnapshot
) {
    const events: {[key: string] : FirebaseFirestore.DocumentData} = {};
    eventQuerySnapshot.docs.forEach((doc) => {
        const event = doc.data();
        const startDatetime = (event.start_datetime as Timestamp).toDate().toUTCString();
        events[startDatetime] = event;
    });

    const spreadsheet = backupDoc.sheetsById["1000551982"];
    await spreadsheet.clear();
    await spreadsheet.setHeaderRow(["dj", ...Object.keys(events)]);

    await spreadsheet.addRows(djQerySnapshot.docs.map((djDoc) => {
        const dj = djDoc.data();

        const bigAssGridRow: {[key: string]: "X" | ""} = {
            dj: dj.dj_name,
        };

        Object.values(events).forEach((event) => {
            const startDatetime = (event.start_datetime as Timestamp).toDate().toUTCString();
            bigAssGridRow[startDatetime] = event.dj_plays.map(
                (doc: DocumentReference) => doc.id).includes(djDoc.id) ? "X" : "";
        });

        return bigAssGridRow;
    }));
}
