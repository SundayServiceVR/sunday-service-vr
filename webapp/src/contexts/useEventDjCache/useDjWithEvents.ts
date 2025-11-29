import { useEffect, useState } from "react";
import { Dj, Event } from "../../util/types";
import { useEventDjCache } from "./index"; // adjust if your barrel export differs

export function useDjWithEvents(djId: string | undefined) {
  const { loading, djCache, getEventsByDjId, reloadDj } = useEventDjCache();

  const [dj, setDj] = useState<Dj | undefined>();
  const [events, setEvents] = useState<Event[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!djId) {
      setDj(undefined);
      setEvents([]);
      return;
    }

    setBusy(true);
    (async () => {
      const cached = djCache.get(djId);
      if (cached) {
        setDj(cached);
        setEvents(getEventsByDjId(djId));
        setBusy(false);
        return;
      }

      try {
        const reloaded = await reloadDj(djId);
        if (reloaded) {
          setDj(reloaded);
          setEvents(getEventsByDjId(djId));
        } else {
          setDj(undefined);
          setEvents([]);
        }
      } finally {
        setBusy(false);
      }
    })();
  }, [djId, djCache, getEventsByDjId, reloadDj]);

  return {
    dj,
    events,
    loading: loading || busy,
  };
}
