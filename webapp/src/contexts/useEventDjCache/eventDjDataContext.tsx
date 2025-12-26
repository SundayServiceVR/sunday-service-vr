import { createContext } from "react"
import { Dj, Event, Host } from '../../util/types';
import { DjCache, EventCache, HostCache } from "./types";

type EventDjDataContextType = {
  eventCache: EventCache;
  djCache: DjCache;
  hostCache: HostCache;
  loading: boolean;
  reloadDj: (id: string) => Promise<Dj | null>;
  reloadHost: (id: string) => Promise<Host | null>;
  getEventWithDjs: (id: string) => {
      event: Event;
      djs: (Dj | "PENDING")[];
  } | null;
  getEventsByDjId: (djId: string) => Event[]; // Added function type
  getPlayedDjsForEvent: (event: Event) => Dj[];
};

export const EventDjDataContext = createContext<EventDjDataContextType | undefined>(undefined);

