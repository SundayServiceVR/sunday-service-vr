import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { Event } from "../../webapp/src/util/types";
import { getDjCache } from "../../webapp/src/contexts/useEventDjCache/util";

import { reconcileEventData as reconcileEventDataWebappMethod }
    from "../../webapp/src/hooks/useEventStore/eventReconciliation";

const db = getFirestore("staging");

export const reconcileEventData = onRequest({ secrets: ["BACKUPS_SERVICE_ACCOUNT_KEY"] }, async (request, response) => {
    const eventsToUpdate = await reconcileEventDataMain();
    await db.runTransaction(async (transaction) => {
        eventsToUpdate.forEach((event, eventId) => {
            const docRef = db.collection("events").doc(eventId);
            transaction.set(docRef, event);
        });
    });

    response.json({ updatedDjs: eventsToUpdate });
});

const reconcileEventDataMain = async () => {
    const eventsCollection = db.collection("events");

    // const djs = (await djCollection.get()).docs;
    const events = (await eventsCollection.get()).docs;

    const eventsToUpdate: Map<string, Event> = new Map();

    const djCache = await getDjCache();

    // Reconcile Events
    events.map(async (eventDoc) => {
        // For each dj, we need to make sure events are updated.
        const event = eventDoc.data as unknown as Event;

        // Calculate Dj Plays
        const reconciledEvent = await reconcileEventDataWebappMethod(event, djCache);

        // For each entry in event.slots, if the slot has a property "dj_ref",
        // we should populate signups based off of what we can figure out from the slot,
        // then point new slots to those signups.
        if (reconciledEvent.id) {
            eventsToUpdate.set(reconciledEvent.id, reconciledEvent);
        } else {
            console.warn("Reconciled event is missing an ID:", reconciledEvent);
        }
    });

    // Reconcile sortname name.
    return eventsToUpdate;
};

