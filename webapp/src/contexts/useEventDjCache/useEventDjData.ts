import { useState, useEffect, useCallback } from 'react';
import { Dj, Event, Host } from '../../util/types';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../../util/firebase';
import { docToEvent, docToHost } from '../../store/converters';
import { DjCache, EventCache, HostCache } from './types';
import { getDjCache } from './util';

export type EventDjStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useEventDjData() {
  const [eventCache, setEventCache] = useState<EventCache>(new Map());
  const [djCache, setDjCache] = useState<DjCache>(new Map());
  const [hostCache, setHostCache] = useState<HostCache>(new Map());
  const [status, setStatus] = useState<EventDjStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  const reloadAllDjs = useCallback(async () => {
    const cache = await getDjCache();
    setDjCache(cache);
  }, []);

  const reloadAllHosts = useCallback(async () => {
    const q = query(collection(db, 'hosts'));
    const querySnapshot = await getDocs(q);
    const map: HostCache = new Map();

    querySnapshot.docs.forEach(docSnap => {
      map.set(docSnap.id, docToHost(docSnap));
    });

    setHostCache(map);
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

  const reloadHost = useCallback(async (id: string): Promise<Host | null> => {
    const docRef = doc(db, 'hosts', id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) return null;

    const host = docToHost(docSnapshot);
    setHostCache(prev => {
      const next = new Map(prev);
      next.set(id, host);
      return next;
    });
    return host;
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
        await Promise.all([reloadAllDjs(), reloadAllHosts(), reloadAllEvents()]);
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
  }, [reloadAllDjs, reloadAllHosts, reloadAllEvents]);

  const getEventWithDjs = useCallback(
    (id: string) => {
      const event = eventCache.get(id);
      if (!event) return null;

      // Prefer the canonical shape: resolve DJs via the signup's dj_refs.
      const refsFromSignups = event.slots
        .map(slot => event.signups.find(signup => signup.uuid === slot.signup_uuid))
        .filter((signup): signup is NonNullable<typeof signup> => signup != null)
        .map(signup => signup.dj_refs)
        .filter((refs): refs is NonNullable<typeof refs> => refs != null)
        .flat();

      const refs = refsFromSignups.filter(ref => ref != null);

      const djs = refs.map(ref => djCache.get(ref.id) ?? 'PENDING');

      return { event, djs };
    },
    [eventCache, djCache]
  );

  const getEventsByDjId = useCallback(
    (djId: string) => {
      return Array.from(eventCache.values()).filter(event => {
        // Canonical shape: DJs live on the signup (dj_refs), so match slots -> signup -> dj_refs.
        return event.slots.some(slot => {
          const signup = event.signups.find(s => s.uuid === slot.signup_uuid);
          return signup?.dj_refs?.some(ref => ref.id === djId) ?? false;
        });
      });
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

      const allRefs = [...djRefsFromSignups];

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
    hostCache,
    status,
    loading,
    ready,
    error,
    reloadAllDjs,
    reloadAllHosts,
    reloadAllEvents,
    reloadDj,
    reloadHost,
    getEventWithDjs,
    getEventsByDjId,
    getPlayedDjsForEvent,
  };
}
