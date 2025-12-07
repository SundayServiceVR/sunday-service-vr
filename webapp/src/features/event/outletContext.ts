import { useOutletContext } from "react-router";
import { Event } from "../../util/types";

export type EventRouterOutletMembers = [
    Event,
    (event: Event) => void,
    (file: File | null) => void,
];

export function useEventOperations() {
    return useOutletContext<EventRouterOutletMembers>();
}
