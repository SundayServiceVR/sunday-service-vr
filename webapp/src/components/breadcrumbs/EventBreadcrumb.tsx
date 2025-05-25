import { useEffect, useState } from "react";
import { Event } from "../../util/types";
import { useEventDjCache } from "../../contexts/useEventDjCache";
import { RouteMatch } from "react-router";

type EventBreadcrumbProps = {
  match: RouteMatch;
}
const EventBreadcrumb = ({match}: EventBreadcrumbProps) => {

  const { eventCache } = useEventDjCache();
  const [ event, setEvent ] = useState<Event>();

  const eventId = match.params.eventId;

  useEffect(() => {
    if (!eventId) return;

    (async () => {
      // Attempt to fetch the event from the cache
      const cachedEvent = await eventCache.get(eventId);
      if (cachedEvent) {
        setEvent(cachedEvent);
      } else {
        console.error(`Event with ID ${eventId} not found in cache.`);
      }
    }
    )();
    // If the eventId changes, we need to fetch the new event
  }, [eventId, eventCache, setEvent]); 

  return <span>{event ? `${event.name} (${event.end_datetime?.toLocaleDateString()})` : eventId}</span>;  
}

export default EventBreadcrumb;