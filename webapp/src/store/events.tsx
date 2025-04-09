import { nextSundayServiceDefaultDateTime } from '../util/util';
import { Event } from '../util/types';
import { Timestamp,  collection, getDocs, orderBy, query, where } from 'firebase/firestore';
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