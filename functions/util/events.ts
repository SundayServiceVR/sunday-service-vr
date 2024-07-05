
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { docToEventRaw } from "../../webapp/src/store/converters";

export const getNextEvent = async () => {
    const docRef = await getFirestore()
    .collection("events")
    .where("end_datetime", ">", Timestamp.now())
    .orderBy("start_datetime", "asc");

    const snapshot = await docRef.get();

    const eventDoc = snapshot.docs[0]?.data();
    const event = docToEventRaw(eventDoc);

    return event;
}