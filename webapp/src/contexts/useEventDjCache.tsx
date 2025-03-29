import { useContext } from "react";
import { EventDjPlayMapperContext } from "./eventDjCacheProvider";

export const useEventDjCache = () => {
  const context = useContext(EventDjPlayMapperContext);
  if (context === undefined) {
    throw new Error('useEventDjPlayMapper must be used within an EventDjPlayMapperProvider');
  }
  return context;
};