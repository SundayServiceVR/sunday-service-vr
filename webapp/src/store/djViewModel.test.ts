import { describe, it, expect } from "vitest";
import { getDjStreamLinks, getLatestDjStreamLink } from "../store/djViewModel";
import { Event, EventSignup, SlotType, SlotDuration } from "../util/types";
import { mockDocRef } from "../test/mockDocRef";
import { DocumentReference } from "firebase/firestore";


describe("djViewModel", () => {
    // replaced Dj object with djId string
    const djId = "dj1";

    // Helper to create a minimal EventSignup
    const makeSignup = (stream_link?: string, dj_ref_id: string = "dj1"): EventSignup => ({
        uuid: "signup-uuid",
        name: "DJ One",
        requested_duration: 1 as SlotDuration,
        type: SlotType.LIVE,
        dj_refs: [mockDocRef(dj_ref_id) as unknown as DocumentReference],
        is_debut: false,
        event_signup_form_data: { event_id: "event-id", stream_link }
    });

    // Helper to create a minimal Event
    const makeEvent = (start_datetime: string, signup?: EventSignup): Event => {
        return {
            id: "event-id",
            name: "Event Name",
            published: true,
            message: "Event Message",
            start_datetime: new Date(start_datetime),
            end_datetime: new Date(start_datetime),
            host: "host-id",
            slots: [],
            footer: "footer",
            signups: [signup ?? makeSignup()],
            signupsAreOpen: true,
            dj_plays: [mockDocRef("dj1") as unknown as DocumentReference],
            lastUpdated: new Date(start_datetime)
        };
    };


    it("returns unique stream links in most-recent-first order", () => {
        const events = [
            makeEvent("2023-01-01T10:00:00Z"),
            makeEvent("2023-01-02T10:00:00Z", makeSignup("https://twitch.tv/dj2")),
            makeEvent("2023-01-03T10:00:00Z", makeSignup("https://twitch.tv/dj1"))
        ];
        const links = getDjStreamLinks(djId, events);
        expect(links).toEqual([
            "https://twitch.tv/dj1",
            "https://twitch.tv/dj2"
        ]);
    });


    it("returns the most recent stream link", () => {
        const events = [
            makeEvent("2023-01-01T10:00:00Z"),
            makeEvent("2023-01-02T10:00:00Z", makeSignup("https://twitch.tv/dj2")),
            makeEvent("2023-01-03T10:00:00Z", makeSignup("https://twitch.tv/dj1"))
        ];
        const latest = getLatestDjStreamLink(djId, events);
        expect(latest).toBe("https://twitch.tv/dj1");
    });

    it("returns empty array if no events", () => {
        expect(getDjStreamLinks(djId, [])).toEqual([]);
    });

    it("returns undefined for latest link if no events", () => {
        expect(getLatestDjStreamLink(djId, [])).toBeUndefined();
    });

    it("ignores slots without a stream link", () => {
        const event = makeEvent("2023-01-01T10:00:00Z", makeSignup(undefined, "dj1"));
        expect(getDjStreamLinks(djId, [event])).toEqual([]);
    });

    it("returns the most recent stream link, even if it was used way earlier ago", () => {
        const events = [
            makeEvent("2023-01-01T10:00:00Z"),
            makeEvent("2023-01-03T10:00:00Z", makeSignup("https://twitch.tv/dj1")),
            makeEvent("2023-01-02T10:00:00Z", makeSignup("https://twitch.tv/dj2")),
            makeEvent("2023-01-04T10:00:00Z", makeSignup("https://twitch.tv/dj1"))
        ];
        const latest = getLatestDjStreamLink(djId, events);
        expect(latest).toBe("https://twitch.tv/dj1");
    });

});
