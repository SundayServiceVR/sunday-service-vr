import { DocumentData } from "firebase/firestore";
import { Slot, Event } from "../util/types";


// Any is used here because we literally aren't sure of the shape that's stored in the db.
// To address this, we will need to use a converter on the doc where we have our snapshot coming in
// https://firebase.google.com/docs/reference/node/firebase.firestore.FirestoreDataConverter
// Issue #59

/**
 * Converts a firebase doc to an event and populates its id
 * 
 * @param doc 
 * @returns 
 */
export const docToEvent = (doc: DocumentData) => {
    const data = doc.data();
    if (data) {
      return {
        ...docToEventRaw(data),
        id: doc.ref.id,
      } as Event;
    }
    return null;
  }
  
/**
 * Converts a raw json object into an event
 * 
 * @param data 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const docToEventRaw = (data: any) => {
  if (data) {
      const event = {
          ...data,
          start_datetime: data.start_datetime.toDate(),
          end_datetime: data.end_datetime?.toDate(),
          published: data.published ?? false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          slots: data.slots.map((slot: any) => ({ ...slot, start_time: slot.start_time.toDate() }) as Slot),
          signups: data.signups ?? [],
      } as Event;

      return event;
  }
  return null;
}
