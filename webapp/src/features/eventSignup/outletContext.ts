import { useOutletContext } from "react-router";
import { Dj, Event } from "../../util/types";

export type EventSignupRouterOutletMemebers = {
    event: Event, 
    dj: Dj,
};

export function useEventSignupOutletMembers() {
    return useOutletContext<EventSignupRouterOutletMemebers>();
}
