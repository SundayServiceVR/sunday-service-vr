import { nextSundayServiceDefaultDateTime } from '../util/util';
import { Event } from '../util/types';
import { Timestamp, addDoc, collection, doc, getDocs, orderBy, query, arrayUnion, arrayRemove, where, runTransaction } from 'firebase/firestore';
import { db } from '../util/firebase';
import { docToEvent } from './converters';

export const default_event: Event = {
  name: "Sunday Service",
  start_datetime: nextSundayServiceDefaultDateTime(),
  end_datetime: nextSundayServiceDefaultDateTime(),
  published: false,
  host: "",
  message: "Come by to chill and wiggle to some Sunday Service tunes!",
  slots: [],
  footer: "https://discord.s4vr.net/\nhttps://twitch.s4vr.net/",
  dj_plays: [],
  signups: [],
}

export const createEvent = async (event: Event) => {
  // TODO:  Verify that there are no preexisting events that collide with this time.
  const result = await addDoc(collection(db, "events"), event);
  return result;
}

export const saveEvent = async (event: Event, previousEvent?: Event) => {
  event = calcSlotTimes(event);
  event = setDjPlays(event);

  const eventId = event.id;

  if (!eventId) {
    throw (new Error("Attempted to save an event with no assigned id"));
  }

  // Reconcile dj.events

  const djsAdded = event.dj_plays.filter(dj => !previousEvent?.dj_plays.includes(dj));
  const djsRemoved = previousEvent?.dj_plays.filter(dj => !event?.dj_plays.includes(dj)) ?? [];

  await runTransaction(db, async (transaction) => {
    const eventRef = doc(db, "events", eventId);
    transaction.set(eventRef, event);

    // Add event to each DJ in djsAdded
    for (const dj of djsAdded) {
      const djRef = doc(db, "djs", dj.id);
      transaction.update(djRef, {
        events: arrayUnion(
          doc(db, "events", eventId)
        )
      });
    }

    // Remove event from each DJ in djsRemoved
    for (const dj of djsRemoved) {
      const djRef = doc(db, "djs", dj.id);
      transaction.update(djRef, {
        events: arrayRemove(
          doc(db, "events", eventId)
        )
      });
    }
  });
}

export const calcSlotTimes = (event: Event): Event => {
  const newEvent = { ...event }; // Shallow Copy

  const ONE_HOUR = 60 * 60 * 1000;

  const time_counter = new Date(newEvent.start_datetime);
  for (let i = 0; i < event.slots.length; i++) {
    event.slots[i].start_time = new Date(time_counter);
    time_counter.setTime(time_counter.getTime() + ONE_HOUR * event.slots[i].duration);
  }

  newEvent.end_datetime = new Date(time_counter);

  return newEvent;
}

// Before saving, we want to set dj plays for tracking here.
const setDjPlays = (event: Event) => {

  const legacyDjPlays = event.slots.map(slot => slot.dj_ref) ?? []

  const newDjPlays = event.slots.map(slot => event.signups.find(signup => signup.uuid === slot.signup_uuid))
    .filter(slot => slot !== undefined)
    .map(signup => signup.dj_refs).flat();

  return {
    ...event,
    dj_plays: [...legacyDjPlays, ...newDjPlays]
  } as Event
}

/**
 * Fetches the next event (whether or not it was published)
 * 
 * @returns 
 */
export const getNextEvent = async () => {
  const q = query(collection(db, "events"), where("end_datetime", ">", Timestamp.now()), orderBy("start_datetime", "asc"));
  
  const querySnapshot = await getDocs(q);

  const events: Event[] = querySnapshot.docs
      .map((doc) => docToEvent(doc))
      .filter((event): event is Exclude<typeof event, null> => event !== null)
      .map(event => setDjPlays(event));

  return events[0] ?? null;
}

export const getCurrentEvent = async () => {
  const q = query(
    collection(db, "events"),
    where("start_datetime", "<=", Timestamp.now()),
    where("end_datetime", ">", Timestamp.now()),
    orderBy("start_datetime", "asc"));

  const querySnapshot = await getDocs(q);

  const events: Event[] = querySnapshot.docs
      .map((doc) => docToEvent(doc))
      .filter((event): event is Exclude<typeof event, null> => event !== null)
      .map(event => setDjPlays(event));

  return events[0] ?? null;
}

export const  getAllEvents = async (order: "desc" | "asc", when?: "past" | "future") => {
  let q = query(collection(db, "events"), orderBy("start_datetime", order));

  if(when === "past") {
    q = query(collection(db, "events"), where("start_datetime", "<" , Timestamp.now()), orderBy("start_datetime", order));
  }

  if(when === "future") {
    q = query(collection(db, "events"), where("start_datetime", ">=", Timestamp.now()), orderBy("start_datetime", order));
  }

  const querySnapshot = await getDocs(q);

  const events: Event[] = querySnapshot.docs
      .map((doc) => docToEvent(doc))
      .filter((event): event is Exclude<typeof event, null> => event !== null);

  return events;
}