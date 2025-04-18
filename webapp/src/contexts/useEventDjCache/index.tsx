import { useContext } from "react";
import { EventDjPlayMapperContext } from "./eventDjCacheContext";

export const useEventDjCache = () => {
  const context = useContext(EventDjPlayMapperContext);
  if (context === undefined) {
    throw new Error('useEventDjCache must be used within an EventDjCacheProvider');
  }
  return context;
};