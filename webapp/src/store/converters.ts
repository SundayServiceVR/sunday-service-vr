import { DocumentData, Timestamp } from "firebase/firestore";
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
    return {
      ...docToEventRaw(data),
      id: doc.ref.id,
    } as Event;
  }
  
/**
 * Converts a raw json object into an event
 * 
 * @param data 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const docToEventRaw = (data: any) => {

  if (!data) {
    throw new Error("Event is null or undefined");
  }

  return {
      ...data,
      start_datetime: extractDate(data.start_datetime),
      end_datetime: extractDate(data.end_datetime),
      published: data.published ?? false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slots: data.slots.map((slot: any) => ({ ...slot, start_time: extractDate(slot.start_time) }) as Slot),
      signups: data.signups ?? [],
  } as Event;
}

function extractDate(date: Date | Timestamp | string): Date {
  if (date instanceof Date) {
    return date;
    } else if (typeof (date as Timestamp).toDate === "function") {
    return (date as Timestamp).toDate();
  } else if (typeof date === "string") {
    return new Date(date);
  } else {
    throw new Error("Invalid date format");
  }
}