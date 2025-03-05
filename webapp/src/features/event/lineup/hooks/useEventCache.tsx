import { doc, DocumentReference, runTransaction } from "firebase/firestore";
import { useCallback, useState } from "react";
import { Event } from "../../../../util/types";
import { db } from "../../../../util/firebase";
import { docToEvent } from "../../../../store/converters";

type Pendable<T> = T | null | "PENDING";
type PendableEventMap = Map<DocumentReference["id"], Pendable<Event>>;

export const useEventCache = () => {
  const [eventCache, setEventCache] = useState<PendableEventMap>(new Map());

  const fetchEvents = useCallback(
    (eventRefs: DocumentReference[]) => {
      let shouldLoad: boolean = false;
      const newCache:PendableEventMap = new Map(eventCache);

      eventRefs.forEach((event) => {
        if (!eventCache.has(event.id)) {
          newCache.set(event.id, "PENDING");
          shouldLoad = true;
          setEventCache(newCache);
        }
      });

      if(shouldLoad) {
        const pendingEvents = Array.from(newCache.entries())
          .filter(([, value]) => value === "PENDING")
          .map(([key]) => key);

        runTransaction(db, async (transaction) => {
          const fetchedEvents = await Promise.all(
            pendingEvents.map(async (eventRef) => {
              const eventDoc = await transaction.get(doc(db, "events", eventRef));
              return { eventRef, event: docToEvent(eventDoc) };
            })
          );

          const updatedCache = new Map(eventCache);
          fetchedEvents.forEach(({ eventRef, event }) => {
            updatedCache.set(eventRef, event);
          });


          setEventCache(updatedCache);
        });
      }
    },
    [eventCache]);

  return { fetchEvents, eventCache };
}