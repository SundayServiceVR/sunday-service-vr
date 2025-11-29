import { useContext } from "react";
import { EventDjDataContext } from "./eventDjDataContext";

export const useEventDjCache = () => {
  const context = useContext(EventDjDataContext);
  if (context === undefined) {
    throw new Error('useEventDjCache must be used within an EventDjDataProvider');
  }
  return context;
};