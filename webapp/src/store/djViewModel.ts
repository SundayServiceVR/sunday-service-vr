import { Dj, Event } from "../util/types";

/**
 * Computes a list of unique stream links used by the given DJ across the provided events.
 *
 * A link is included only if:
 * - The slot has a signup with event_signup_form_data.stream_link, and
 * - The slot's djs collection contains this DJ (matched by discord_id).
 */
export const getDjStreamLinks = (dj: Dj, events: Event[]): string[] => {
    if (!dj || !events || events.length === 0) {
        return [];
    }

    const links = events
        .flatMap(event => event.slots ?? [])
        .filter(slot =>
            slot.reconciled?.signup?.event_signup_form_data?.stream_link &&
            slot.djs?.some(s => s.discord_id === dj.discord_id)
        )
        .map(slot => slot.reconciled.signup.event_signup_form_data!.stream_link!)
        .filter((link): link is string => typeof link === "string" && link.trim().length > 0);

    return Array.from(new Set(links));
};

/**
 * Returns the most recently used stream link for the DJ based on event start_datetime.
 * If multiple events share the same link, the one with the latest date wins, but since links
 * are identical the specific choice doesn't matter.
 */
export const getLatestDjStreamLink = (dj: Dj, events: Event[]): string | undefined => {
    const links = getDjStreamLinks(dj, events);
    if (links.length === 0) {
        return undefined;
    }

    // Convention: getDjStreamLinks returns links in ascending chronological order
    // when given events in ascending order. The "most recent" is therefore the last.
    return links[links.length - 1];
};

