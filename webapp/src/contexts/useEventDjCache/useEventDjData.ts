import { useState, useEffect, useCallback } from 'react';
import { Dj, Event } from '../../util/types';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../util/firebase';
import { docToEvent } from '../../store/converters';
import { DjCache, EventCache } from './types';
import { getDjCache } from './util';

export type EventDjStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useEventDjData() {
  const [eventCache, setEventCache] = useState<EventCache>(new Map());
  const [djCache, setDjCache] = useState<DjCache>(new Map());
  const [status, setStatus] = useState<EventDjStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  const reloadAllDjs = useCallback(async () => {
    const cache = await getDjCache();
    setDjCache(cache);
  }, []);

  const reloadDj = useCallback(async (id: string): Promise<Dj | null> => {
    const docRef = doc(db, 'djs', id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) return null;

    const dj = docSnapshot.data() as Dj;
    setDjCache(prev => {
      const next = new Map(prev);
      next.set(id, dj);
      return next;
    });
    return dj;
  }, []);

  const reloadAllEvents = useCallback(async () => {
    const q = query(collection(db, 'events'));
    const querySnapshot = await getDocs(q);
    const map: EventCache = new Map();

    querySnapshot.docs.forEach(docSnap => {
      map.set(docSnap.id, docToEvent(docSnap));
    });

    setEventCache(map);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus('loading');
      setError(null);
      try {
        await Promise.all([reloadAllDjs(), reloadAllEvents()]);
        if (!cancelled) setStatus('ready');
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setStatus('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadAllDjs, reloadAllEvents]);

  const getEventWithDjs = useCallback(
    (id: string) => {
      const event = eventCache.get(id);
      if (!event) return null;

      const djs =
        event.slots
          ?.map(slot => slot.dj_ref)
          .map(djRef => djCache.get(djRef.id) ?? 'PENDING') ?? [];

      return { event, djs };
    },
    [eventCache, djCache]
  );

  const getEventsByDjId = useCallback(
    (djId: string) => {
      return Array.from(eventCache.values()).filter(event =>
        event.slots.some(slot => slot.dj_ref.id === djId)
      );
    },
    [eventCache]
  );

  const getPlayedDjsForEvent = useCallback(
    (event: Event) => {
      const djRefsFromSignups = event.slots
        .map(slot => event.signups.find(signup => signup.uuid === slot.signup_uuid))
        .filter(slot => slot != null)
        .map(slot => slot?.dj_refs)
        .filter(refs => refs != null)
        .flat();

      // TODO : Legacy signup shape.  Remove after data cleanup
      const djRefsFromLegacy = event.slots
        .map(slot => slot.dj_ref)
        .filter(ref => ref != null);

      const allRefs = [...djRefsFromSignups, ...djRefsFromLegacy];

      const djs = allRefs
        .filter(ref => ref != null)
        .map(ref => djCache.get(ref!.id))
        .filter((dj): dj is Dj => dj != null);

      return djs;
    },
    [djCache]
  );

  const loading = status === 'loading';
  const ready = status === 'ready';

  return {
    eventCache,
    djCache,
    status,
    loading,
    ready,
    error,
    reloadAllDjs,
    reloadAllEvents,
    reloadDj,
    getEventWithDjs,
    getEventsByDjId,
    getPlayedDjsForEvent,
  };
}
