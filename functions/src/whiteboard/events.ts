
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { docToEventRaw } from "../../../webapp/src/store/converters";

/**
 * Fetches the next event.
 * @param {boolean} includeNonPublished If true, the published field will be ignored.  Defaults to `false`
 * @return {event}
 */
export const getNextEvent = async (includeNonPublished = false) => {
    let docRef = await getFirestore()
        .collection("events")
        .where("end_datetime", ">", Timestamp.now())
        .orderBy("start_datetime", "asc");

    if (!includeNonPublished) {
        docRef = docRef.where("published", "==", true);
    }

    const snapshot = await docRef.get();

    const eventDoc = snapshot.docs[0]?.data();
    if (!eventDoc) {
        return null;
    }
    const event = docToEventRaw(eventDoc);

    return event;
};
