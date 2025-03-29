import { useState, ReactNode, useEffect } from 'react';
import { Dj, Event } from '../util/types';
import { EventDjPlayMapperContext } from './eventDjCacheProvider';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../util/firebase';
import { docToEvent } from '../store/converters';

export const EventDjPlayMapperProvider = ({ children }: { children: ReactNode }) => {
  const [eventCache, setEventCache] = useState<Map<string, Event>>(new Map());
  const [djCache, setDjCache] = useState<Map<string, Dj>>(new Map());

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
    const map = new Map<string, Event>();
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

  return (
    <EventDjPlayMapperContext.Provider value={{ eventCache, djCache, getEventWithDjs, getEventsByDjId, loading }}>
      {children}
    </EventDjPlayMapperContext.Provider>
  );
};
