import { createContext } from "react"
import { Dj, Event, Slot } from '../../util/types';
import { DjCache, EventCache } from "./types";

type EventDjCacheContextType = {
  eventCache: EventCache;
  djCache: DjCache;
  loading: boolean;
  getEventWithDjs: (id: string) => {
      event: Event;
      djs: (Dj | "PENDING")[];
  } | null;
  getEventsByDjId: (djId: string) => Event[]; // Added function type
  getPlayedDjsForEvent: (event: Event) => Dj[];
  getDjsForSlot: (event: Event, slot: Slot) => Dj[];
};

export const EventDjPlayMapperContext = createContext<EventDjCacheContextType | undefined>(undefined);

