import { reconcileEventData } from "./eventReconciliation";
import { Event } from "../../util/types";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, orderBy, query, runTransaction, Timestamp, where } from "@firebase/firestore";
import { docToEvent } from "../../store/converters";
import { db } from "../../util/firebase";
import { useEventDjCache } from "../../contexts/useEventDjCache";
import { useCallback } from "react";

export const useEventStore = () => {
  const { djCache } = useEventDjCache();

  const getReconcicledEvent = useCallback((event: Event) => reconcileEventData(event, djCache), [djCache]);

  const getNextEvent = useCallback(async () => {
    const q = query(collection(db, "events"), where("end_datetime", ">", Timestamp.now()), orderBy("start_datetime", "asc"));

    const querySnapshot = await getDocs(q);

    const events: Event[] = querySnapshot.docs
      .map((doc) => docToEvent(doc))
      .filter((event): event is Exclude<typeof event, null> => event !== null)
      .map(event => getReconcicledEvent(event));

    return events[0] ?? null;
  }, [getReconcicledEvent]);

  const getCurrentEvent = useCallback(async () => {
    const q = query(
      collection(db, "events"),
      where("start_datetime", "<=", Timestamp.now()),
      where("end_datetime", ">", Timestamp.now()),
      orderBy("start_datetime", "asc"));

    const querySnapshot = await getDocs(q);

    const events: Event[] = querySnapshot.docs
      .map((doc) => docToEvent(doc))
      .filter((event): event is Exclude<typeof event, null> => event !== null)
      .map(event => getReconcicledEvent(event));

    return events[0] ?? null;
  }, [getReconcicledEvent]);

  const createEvent = useCallback(async (event: Event) => {
    const result = await addDoc(collection(db, "events"), event);
    return result;
  }, []);

  const saveEvent = useCallback(async (event: Event, previousEvent?: Event) => {
    event = getReconcicledEvent(event);

    const eventId = event.id;

    if (!eventId) {
      throw (new Error("Attempted to save an event with no assigned id"));
    }

    const djsAdded = event.dj_plays.filter(dj => !previousEvent?.dj_plays.includes(dj));
    const djsRemoved = previousEvent?.dj_plays.filter(dj => !event?.dj_plays.includes(dj)) ?? [];

    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "events", eventId);
      transaction.set(eventRef, event);

      for (const dj of djsAdded) {
        const djRef = doc(db, "djs", dj.id);
        transaction.update(djRef, {
          events: arrayUnion(
            doc(db, "events", eventId)
          )
        });
      }

      for (const dj of djsRemoved) {
        const djRef = doc(db, "djs", dj.id);
        transaction.update(djRef, {
          events: arrayRemove(
            doc(db, "events", eventId)
          )
        });
      }
    });
  }, [getReconcicledEvent]);

  return { 
    createEvent,
    saveEvent,
    getReconcicledEvent,
    getCurrentEvent,
    getNextEvent
  };
}