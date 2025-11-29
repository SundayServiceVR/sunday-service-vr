import { ReactNode } from 'react';
import { EventDjDataContext } from './eventDjDataContext';
import { useEventDjData } from './useEventDjData';

export const EventDjDataProvider = ({ children }: { children: ReactNode }) => {
  const value = useEventDjData();

  return (
    <EventDjDataContext.Provider value={value}>
      {children}
    </EventDjDataContext.Provider>
  );
};
