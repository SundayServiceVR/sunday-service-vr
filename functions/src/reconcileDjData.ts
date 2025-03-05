import { onRequest } from "firebase-functions/v2/https";
import { DocumentData, getFirestore } from "firebase-admin/firestore";
import { Dj, Event } from "../../webapp/src/util/types";

const db = getFirestore("staging");

export const reconsileDjData = onRequest({ secrets: ["BACKUPS_SERVICE_ACCOUNT_KEY"] }, async (request, response) => {
    const djsToUpdate = await reconcileDjData();

    // For each dj in djsToUpdate, we should update it in firebase
    await db.runTransaction(async (transaction) => {
        djsToUpdate.forEach((dj) => {
            const djRef = db.collection("djs").doc(dj.id);
            transaction.set(djRef, dj.dj);
        });
    });

    response.json({ updatedDjs: djsToUpdate });
});

const reconcileDjData = async () => {
    const djCollection = db.collection("djs");
    const eventsCollection = db.collection("events");

    const djs = (await djCollection.get()).docs;
    const events = (await eventsCollection.get()).docs;

    const updatedDjsToEventMap = mapEventsToDjs(events);

    const djsToUpdate: {dj: Dj, id: string}[] = [];

    // Reconcile Events
    Object.entries(updatedDjsToEventMap).forEach(([djId, events]) => {
        // For each dj, we need to make sure events are updated.
        const dj = djs.find((dj) => dj.id === djId)?.data() as Dj | undefined;
        if (dj == null) {
            throw new Error(`DJ: ${dj} is unable to be reconciled because it was not found in the 'djs' collection`);
        }

        if (!listOfEventsMatch(dj.events, events)) {
            dj.events = events.map((event) => event.ref);
            djsToUpdate.push({ dj, id: djId });
        }
    });

    // Reconcile sortname name.
    return djsToUpdate;
};

const mapEventsToDjs = (events: DocumentData[]) => {
    const updatedDjsToEventMap = new Map<string, DocumentData[]>();

    events.forEach((eventDoc) => {
        const eventData = eventDoc.data() as Event;

        const eventDjs = eventData.slots.map((slot) => slot.dj_ref);
        eventDjs.forEach((djRef) => {
            if (updatedDjsToEventMap.has(djRef.id)) {
                updatedDjsToEventMap.get(djRef.id)?.push(eventDoc);
            } else {
                updatedDjsToEventMap.set(djRef.id, [eventDoc]);
            }
        });
    });
    return Object.fromEntries(updatedDjsToEventMap);
};

const listOfEventsMatch = (oneListOfEventIds: DocumentData[], anotherListOfEventIds: DocumentData[]) => {
    const oneSetOfEvents = new Set(oneListOfEventIds);
    const anotherSetOfEvents = new Set(anotherListOfEventIds);

    return oneSetOfEvents.size === anotherSetOfEvents.size &&
    [...oneSetOfEvents].every((x) => anotherSetOfEvents.has(x));
};
