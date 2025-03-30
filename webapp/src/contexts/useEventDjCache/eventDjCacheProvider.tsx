import { useState, ReactNode, useEffect } from 'react';
import { Dj, Event, Slot } from '../../util/types';
import { EventDjPlayMapperContext } from './eventDjCacheContext';
import { collection, DocumentReference, getDocs, query } from 'firebase/firestore';
import { db } from '../../util/firebase';
import { docToEvent } from '../../store/converters';
import { DjCache, EventCache } from './types';

export const EventDjPlayMapperProvider = ({ children }: { children: ReactNode }) => {
  const [eventCache, setEventCache] = useState<EventCache>(new Map());
  const [djCache, setDjCache] = useState<DjCache>(new Map());

  const [ loading, setLoading ] = useState<boolean>(false);

  const reloadAllDjs = async () => {
    const q = query(collection(db, "djs"));
    const querySnapshot = await getDocs(q);

    const djs = querySnapshot.docs.map(doc => ({ id: doc.id, dj: doc.data() as Dj }));
    const djCache = new Map<string, Dj>();
    djs.forEach(dj => djCache.set(dj.id, dj.dj))
    setDjCache(djCache)
  }

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

  const getSignupForSlot = (event: Event, slot: Slot) => {
    const result =  event.signups.find(signups => signups.uuid === slot.signup_uuid);
    return result;
  }

  const getDjsForSlot = (event: Event, slot: Slot) => {
    
    const refsFromSignup: DocumentReference[] = getSignupForSlot(event, slot)?.dj_refs ?? [];

    // TODO : Legacy signup shape.  Removed after data cleanup
    const djRefsFromLegacy = slot.dj_ref;

    const result = [...refsFromSignup, djRefsFromLegacy].filter(ref => ref != undefined).map(ref => djCache.get(ref!.id)).filter(dj => dj != undefined);
    return result as Dj[];
  }

  const getPlayedDjsForEvent = (event: Event) => {
    const djRefsFromSignups = event.slots
      .map(slot => event.signups.find(signup => signup.uuid === slot.signup_uuid))
      .filter(slot => slot != undefined)
      .map(slot => slot?.dj_refs)
      .filter(ref => ref != undefined)
      .flat()

    // TODO : Legacy signup shape.  Removed after data cleanup
    const djRefsFromLegacy = event.slots
      .map(slot => slot.dj_ref)
      .filter(ref => ref != undefined)
      .flat()

    const result = [...djRefsFromSignups, ...djRefsFromLegacy].filter(ref => ref != undefined).map(ref => djCache.get(ref!.id)).filter(dj => dj != undefined);
    return result as Dj[];
  }

  return (
    <EventDjPlayMapperContext.Provider value={{ eventCache, djCache, getEventWithDjs, getEventsByDjId, getPlayedDjsForEvent, getDjsForSlot, loading }}>
      {children}
    </EventDjPlayMapperContext.Provider>
  );
};
