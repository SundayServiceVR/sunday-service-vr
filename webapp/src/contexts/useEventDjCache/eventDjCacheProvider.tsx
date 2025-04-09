import { useState, ReactNode, useEffect } from 'react';
import { Dj, Event, Slot } from '../../util/types';
import { EventDjPlayMapperContext } from './eventDjCacheContext';
import { collection, doc, DocumentReference, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../util/firebase';
import { docToEvent } from '../../store/converters';
import { DjCache, EventCache } from './types';
import { getSignupForSlot } from './helpers';
import { getDjCache } from './util';

export const EventDjPlayMapperProvider = ({ children }: { children: ReactNode }) => {
  const [eventCache, setEventCache] = useState<EventCache>(new Map());
  const [djCache, setDjCache] = useState<DjCache>(new Map());

  const [ loading, setLoading ] = useState<boolean>(false);

  const reloadAllDjs = async () => {
    setDjCache(await getDjCache())
  }

  const reloadDj = async (id: string): Promise<Dj | null> => {
    const docRef = doc(db, "djs", id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const dj = docSnapshot.data() as Dj;
      setDjCache(prev => new Map(prev).set(id, dj));
      return dj;
    }
    return null;
  };

  const reloadAllEvents = async () => {
    const q = query(collection(db, "events"));
    const querySnapshot = await getDocs(q);
    const set = querySnapshot.docs.map(doc => ({ id: doc.id, event: docToEvent(doc) }));
    const map: EventCache = new Map<string, Event>();
    set.forEach(entity => map.set(entity.id, entity.event))
    setEventCache(map);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      reloadAllDjs(),
      reloadAllEvents()
    ]).finally(
      () => setLoading(false)
    );
  }, []);

  

  const getEventWithDjs = (id: string) => {
    const event = eventCache.get(id);

    if (!event) {
      return null;
    }

    return {
      event,
      djs: (event?.slots.map(slot => slot.dj_ref).map(dj_ref => djCache.get(dj_ref.id) ?? "PENDING")) ?? [],
    }
  }

  const getEventsByDjId = (djId: string) => {
    const events = Array.from(eventCache.values()).filter(event =>
      event.slots.some(slot => slot.dj_ref.id === djId)
    );

    return events;
  };

  const getDjsForSlot = (event: Event, slot: Slot) => {
    
    const signup = getSignupForSlot(event, slot);
    const refsFromSignup: DocumentReference[] = signup?.dj_refs ?? [];


    const djRefsFromLegacy = slot.dj_ref;
    const djRefList = signup
      ? [...refsFromSignup]
      : [ djRefsFromLegacy ]; // Legacy signup shape.  Removed after data cleanup

    const result = djRefList.filter(ref => ref != undefined).map(ref => djCache.get(ref!.id)).filter(dj => dj != undefined);
    return result as Dj[];
  }

  const getPlayedDjsForEvent = (event: Event) => {
    const djRefsFromSignups = event.slots
      .map(slot => event.signups.find(signup => signup.uuid === slot.signup_uuid))
      .filter(slot => slot != undefined)
      .map(slot => slot?.dj_refs)
      .filter(ref => ref != undefined)
      .flat()

    // TODO : Legacy signup shape.  Remove after data cleanup
    const djRefsFromLegacy = event.slots
      .map(slot => slot.dj_ref)
      .filter(ref => ref != undefined)
      .flat()

    const result = [...djRefsFromSignups, ...djRefsFromLegacy].filter(ref => ref != undefined).map(ref => djCache.get(ref!.id)).filter(dj => dj != undefined);
    return result as Dj[];
  }

  return (
    <EventDjPlayMapperContext.Provider value={{ eventCache, djCache, getEventWithDjs, getEventsByDjId, getPlayedDjsForEvent, getDjsForSlot, reloadDj, loading }}>
      {children}
    </EventDjPlayMapperContext.Provider>
  );
};
