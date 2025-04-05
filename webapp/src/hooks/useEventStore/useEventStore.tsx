import { reconcileEventData } from "./eventReconciliation";
import { Event } from "../../util/types";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, orderBy, query, runTransaction, Timestamp, where } from "@firebase/firestore";
import { docToEvent } from "../../store/converters";
import { db } from "../../util/firebase";
import { useEventDjCache } from "../../contexts/useEventDjCache";

export const useEventStore = () => {
  const { djCache } = useEventDjCache();

  const getReconcicledEvent = (event: Event) => reconcileEventData(event, djCache);

  /**
 * Fetches the next event (whether or not it was published)
 * 
 * @returns 
 */
  const getNextEvent = async () => {
    const q = query(collection(db, "events"), where("end_datetime", ">", Timestamp.now()), orderBy("start_datetime", "asc"));

    const querySnapshot = await getDocs(q);

    const events: Event[] = querySnapshot.docs
      .map((doc) => docToEvent(doc))
      .filter((event): event is Exclude<typeof event, null> => event !== null)
      .map(event => getReconcicledEvent(event));

    return events[0] ?? null;
  }

  const getCurrentEvent = async () => {
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
  }

   const createEvent = async (event: Event) => {
    // TODO:  Verify that there are no preexisting events that collide with this time.
    const result = await addDoc(collection(db, "events"), event);
    return result;
  }
  
  const saveEvent = async (event: Event, previousEvent?: Event, ) => {
    event = getReconcicledEvent(event);
  
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

  return { 
    createEvent,
    saveEvent,
    getReconcicledEvent,
    getCurrentEvent,
    getNextEvent
  };
}