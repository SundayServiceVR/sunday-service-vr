
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { docToEventRaw } from "../../../webapp/src/store/converters";

/**
 * Fetches the next event that has not yet ended.
 * @return {event}
 */
export const getNextEvent = async () => {
    const snapshot = await getFirestore()
        .collection("events")
        .where("end_datetime", ">", Timestamp.now())
        .orderBy("start_datetime", "asc")
        .get();

    const eventDoc = snapshot.docs[0]?.data();
    if (!eventDoc) {
        return null;
    }
    const event = docToEventRaw(eventDoc);

    return event;
};
