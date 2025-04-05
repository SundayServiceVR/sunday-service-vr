import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { Dj, Event } from "../../webapp/src/util/types";
import { reconcileEventData as reconcileEventDataWebappMethod }
    from "../../webapp/src/hooks/useEventStore/eventReconciliation";
import { fetchCollection } from "./lib/database";
import { docToEvent } from "../../webapp/src/store/converters";

const db = process.env.FUNCTIONS_EMULATOR ? getFirestore("staging") : getFirestore();

export const reconcileEventData = onRequest({ secrets: ["BACKUPS_SERVICE_ACCOUNT_KEY"] }, async (request, response) => {
    const currentEventsRef = await db.collection("events").get();
    const currentEvents = currentEventsRef.docs.map(docToEvent);
    const eventsToUpdate = await reconcileEventDataMain(currentEvents);

    await db.runTransaction(async (transaction) => {
        eventsToUpdate.forEach((event, eventId) => {
            const docRef = db.collection("events").doc(eventId);
            transaction.set(docRef, event);
        });
    });

    response.json({ updatedEvents: Array.from(eventsToUpdate) });
});

const reconcileEventDataMain = async (currentEvents: Event[]) => {
    const eventsToUpdate: Map<string, Event> = new Map();

    const djs = await fetchCollection(db, "djs");

    const djCache: Map<string, Dj> = new Map();
    djs.forEach((dj) => djCache.set(dj.id, dj as Dj));

    // Reconcile Events
    await currentEvents.map(async (event) => {
        if (!event.id) {
            console.warn(`Event fetched with no id: ${JSON.stringify(event, null, 4)}`);
            return;
        }

        // Calculate Dj Plays
        const reconciledEvent = await reconcileEventDataWebappMethod(event, djCache);

        // Protect against overwriting an event with empty data.
        if (!reconciledEvent || Object.keys(reconciledEvent).length < 0) {
            console.warn(`${event.id}: Reconciled event is null.  Skipping.`);
            return;
        }

        // For each entry in event.slots, if the slot has a property "dj_ref",
        // we should populate signups based off of what we can figure out from the slot,
        // then point new slots to those signups.
        eventsToUpdate.set(event.id, reconciledEvent);
        // console.log(`Setting event: ${event.id}:\n${JSON.stringify(reconciledEvent, null, 4)}`);
    });

    // Reconcile sortname name.
    return eventsToUpdate;
};

