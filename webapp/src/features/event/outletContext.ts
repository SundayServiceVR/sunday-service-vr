import { useOutletContext } from "react-router";
import { Event } from "../../util/types";

export type EventSaveControls = {
    /** True when the scratchpad has edits that are not yet persisted. */
    hasChanges: boolean;
    /** Persists the current scratchpad. Throws on failure. */
    save: () => Promise<void>;
    /** Replaces the scratchpad with the given event and persists it. Throws on failure. */
    saveWith: (event: Event) => Promise<void>;
};

export type EventRouterOutletMembers = [
    Event,
    (event: Event) => void,
    (file: File | null) => void,
    EventSaveControls,
];

export function useEventOperations() {
    return useOutletContext<EventRouterOutletMembers>();
}
