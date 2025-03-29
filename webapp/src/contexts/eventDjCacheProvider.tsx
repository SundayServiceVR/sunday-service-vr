import { createContext } from "react"
import { Dj, Event } from '../util/types';
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
};

export const EventDjPlayMapperContext = createContext<EventDjCacheContextType | undefined>(undefined);

