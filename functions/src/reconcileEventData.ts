import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { Event } from "../../webapp/src/util/types";
import { listOfDocsMatch } from "./lib/util";

const db = getFirestore("staging");

export const reconsileEventData = onRequest({ secrets: ["BACKUPS_SERVICE_ACCOUNT_KEY"] }, async (request, response) => {
    const eventsToUpdate = await reconcileDjData();

    // For each dj in djsToUpdate, we should update it in firebase
    await db.runTransaction(async (transaction) => {
        eventsToUpdate.forEach((event, eventId) => {
            const docRef = db.collection("events").doc(eventId);
            transaction.set(docRef, event);
        });
    });

    response.json({ updatedDjs: eventsToUpdate });
});

const reconcileDjData = async () => {
    // const djCollection = db.collection("djs");
    const eventsCollection = db.collection("events");

    // const djs = (await djCollection.get()).docs;
    const events = (await eventsCollection.get()).docs;

    const eventsToUpdate: Map<string, Event> = new Map();

    // Reconcile Events
    events.map((eventDoc) => {
        // For each dj, we need to make sure events are updated.
        const event = eventDoc.data as unknown as Event;

        // Calculate Dj Plays
        const djPlays = event.slots.map((slot) => slot.dj_ref);
        if (!listOfDocsMatch(event.dj_plays ?? [], djPlays)) {
            event.dj_plays = djPlays;
            eventsToUpdate.set(eventDoc.id, event);
        }

        // For each entry in event.slots, if the slot has a property "dj_ref",
        // we should populate signups based off of what we can figure out from the slot,
        // then point new slots to those signups.
    });

    // Reconcile sortname name.
    return eventsToUpdate;
};

