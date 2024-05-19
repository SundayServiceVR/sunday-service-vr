import { nextSundayServiceDefaultDateTime } from '../util/util';
import { Event, Slot } from '../util/types';
import { DocumentData, addDoc, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../util/firebase';
import { getAusPasteMessage, getUkPasteMessage } from '../util/messageWriters';

export const default_event: Event = {
  name: "Sunday Service",
  start_datetime: nextSundayServiceDefaultDateTime(),
  end_datetime: nextSundayServiceDefaultDateTime(),
  host: "",
  message: "Come by to chill and wiggle to some Sunday Service tunes!",
  slots: [],
  footer: "https://discord.s4vr.net/\nhttps://twitch.s4vr.net/",
}

export const createEvent = async (event: Event) => {
  // TODO:  Verify that there are no preexisting events that collide with this time.
  const result = await addDoc(collection(db, "events"), event);
  return result;
}

export const saveEvent = async (event: Event) => {
  event = calcSlotTimes(event);
  if (!event.id) {
    throw (new Error("Attempted to save an event with no assigned id"));
  }
  await setDoc(doc(db, "events", event.id ?? undefined), event);
}

export const docToEvent = (doc: DocumentData) => {
  const data = doc.data();
  if (data) {
    const event = {
      ...data,
      id: doc.ref.id,
      start_datetime: data.start_datetime.toDate(),
      end_datetime: data.end_datetime?.toDate(),
      slots: data.slots.map((slot: any) => ({ ...slot, start_time: slot.start_time.toDate() }) as Slot)
    } as Event;

    return event;
  }
  return null;
}

export const loadEvent = async () => {
  const docRef = await getDoc(doc(db, "events", "current"));
  return docToEvent(docRef);
}

export const resetEvent = async () => {
  saveEvent(default_event);
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