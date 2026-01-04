import { DocumentData, Timestamp } from "firebase/firestore";
import { Slot, Event, EventSignup, Host } from "../util/types";


// Any is used here because we literally aren't sure of the shape that's stored in the db.
// To address this, we will need to use a converter on the doc where we have our snapshot coming in
// https://firebase.google.com/docs/reference/node/firebase.firestore.FirestoreDataConverter
// Issue #59

/**
 * Converts a firebase doc to an event and populates its id and a
 * lastUpdated timestamp derived from Firestore snapshot metadata.
 * 
 * @param doc 
 * @returns 
 */
export const docToEvent = (doc: DocumentData) => {
    const data = doc.data();
    return {
      ...docToEventRaw(data),
      id: doc.ref.id,
      // updateTime is provided by Firestore on the snapshot; use it to
      // detect whether an incoming change is newer than what the user
      // currently has in their scratchpad.
      lastUpdated: (doc as unknown as { updateTime?: Timestamp })?.updateTime
        ? (doc as unknown as { updateTime: Timestamp }).updateTime.toDate()
        : undefined,
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
      signups: data.signups.map((signup: EventSignup) => ({
        ...signup,
        event_signup_form_data : {
          ...signup.event_signup_form_data,
          available_from: extractDateOrAny(signup?.event_signup_form_data?.available_from),
          available_to: extractDateOrAny(signup?.event_signup_form_data?.available_to),
        },
      }
    )),
  } as Event;
}

type TimestampShell = {
  seconds: number;
  nanoseconds: number;
}

function extractDate(date: Date | Timestamp | TimestampShell | string): Date {
if (date instanceof Date) {
    return date;
  } else if (typeof (date as Timestamp).toDate === "function") {
    return (date as Timestamp).toDate();
  } else if (typeof date === "object" && "seconds" in date && "nanoseconds" in date) {
    // Assuming it's a Timestamp object
    return new Timestamp(date.seconds, date.nanoseconds).toDate();
    // return new Date((date as Timestamp).seconds * 1000 + (date as Timestamp).nanoseconds / 1e6);
  } else if (typeof date === "string") {
    return new Date(date);
  } else {
    throw new Error("Invalid date format");
  }
}

function extractDateOrAny(date: Date | Timestamp | TimestampShell | string | undefined): Date | string {
  if(date === undefined) {
    return "any"
  } else if (date === "any") {
    return "any"
  } else if (date instanceof Date) {
    return date;
  } else {
    return extractDate(date);
  }
}

/**
 * Converts a firebase doc to a host
 * 
 * @param doc - The Firestore document containing host data
 * @returns A Host object with the document data and ID
 */
export const docToHost = (doc: DocumentData): Host => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
    } as Host;
}