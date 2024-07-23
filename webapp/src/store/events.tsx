import { nextSundayServiceDefaultDateTime } from '../util/util';
import { Event } from '../util/types';
import { Timestamp, addDoc, collection, doc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../util/firebase';
import { getAusPasteMessage, getUkPasteMessage } from '../util/messageWriters';
import { docToEvent } from './converters';

export const default_event: Event = {
  name: "Sunday Service",
  start_datetime: nextSundayServiceDefaultDateTime(),
  end_datetime: nextSundayServiceDefaultDateTime(),
  host: "",
  message: "Come by to chill and wiggle to some Sunday Service tunes!",
  slots: [],
  footer: "https://discord.s4vr.net/\nhttps://twitch.s4vr.net/",
  dj_plays: [],
}

export const createEvent = async (event: Event) => {
  // TODO:  Verify that there are no preexisting events that collide with this time.
  const result = await addDoc(collection(db, "events"), event);
  return result;
}

export const saveEvent = async (event: Event) => {
  event = calcSlotTimes(event);
  event = setDjPlays(event);

  if (!event.id) {
    throw (new Error("Attempted to save an event with no assigned id"));
  }
  await setDoc(doc(db, "events", event.id ?? undefined), event);
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

export const updateBoards = async (event: Event) => {
  await updateDoc(doc(db, "whiteboards", "current"), {
    event,
    au: getAusPasteMessage(event),
    gmt: getUkPasteMessage(event),
  });
}

const setDjPlays = (event: Event) => {
  return {
    ...event,
    dj_plays: event.slots.map(slot => slot.dj_ref) ?? []
  } as Event
}

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
      .map(event => setDjPlays(event));;

  return events[0] ?? null;
}