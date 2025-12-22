import { Event } from "../util/types";

/**
 * Computes a list of unique stream links used by the given DJ across the provided events.
 *
 * A link is included only if:
 * - The slot has a signup with event_signup_form_data.stream_link, and
 * - The slot's djs collection contains this DJ (matched by discord_id).
 */
export const getDjStreamLinks = (djId: string, events: Event[]): string[] => {
    // Sort events reverse-chronologically (newest to oldest)
    const sortedEvents = [...events].sort((a, b) => {
        const aDate = new Date(a.start_datetime).getTime();
        const bDate = new Date(b.start_datetime).getTime();
        return bDate - aDate;
    });

    // Trying that again
    const links: Set<string> = new Set(sortedEvents.reverse().flatMap(event => {
        return  event.signups
            .filter(signup => signup.dj_refs.map(djRef => djRef.id).includes(djId))
            .map(signup => signup.event_signup_form_data?.stream_link)
            .filter(link => link != undefined) as string[];
    }));

    return Array.from(links).reverse();
};

/**
 * Returns the most recently used stream link for the DJ based on event start_datetime.
 * If multiple events share the same link, the one with the latest date wins, but since links
 * are identical the specific choice doesn't matter.
 */
export const getLatestDjStreamLink = (djId: string, events: Event[]): string | undefined => {
    const links = getDjStreamLinks(djId, events);
    if (links.length === 0) {
        return undefined;
    }
    // getDjStreamLinks now returns most recent first
    return links[0];
};

