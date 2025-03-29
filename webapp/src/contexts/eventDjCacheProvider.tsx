import { createContext } from "react"
import { Dj, Event } from '../util/types';

type EventDjCacheContextType = {
  eventCache: Map<string, Event>;
  djCache: Map<string, Dj>;
  loading: boolean;
  getEventWithDjs: (id: string) => {
      event: Event;
      djs: (Dj | "PENDING")[];
  } | null;
  getEventsByDjId: (djId: string) => Event[]; // Added function type
};

export const EventDjPlayMapperContext = createContext<EventDjCacheContextType | undefined>(undefined);

