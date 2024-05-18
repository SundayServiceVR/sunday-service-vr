import { useOutletContext } from "react-router";
import { Event } from "../../util/types";

export type EventRouterOutletMemebers = [Event, (event: Event) => void];

export function useEventOperations() {
    return useOutletContext<EventRouterOutletMemebers>();
}
