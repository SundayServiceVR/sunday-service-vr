import { DocumentData } from "firebase/firestore";
import { Slot, Event } from "../util/types";

export const docToEvent = (doc: DocumentData) => {
    const data = doc.data();
    if (data) {
      const event = {
        ...data,
        id: doc.ref.id,
        start_datetime: data.start_datetime.toDate(),
        end_datetime: data.end_datetime?.toDate(),
        // Any is used here because we literally aren't sure of the shape that's stored in the db.
        // To address this, we will need to use a converter on the doc where we have our snapshot coming in
        // https://firebase.google.com/docs/reference/node/firebase.firestore.FirestoreDataConverter
        // Issue #59
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slots: data.slots.map((slot: any) => ({ ...slot, start_time: slot.start_time.toDate() }) as Slot)
      } as Event;
  
      return event;
    }
    return null;
  }
  