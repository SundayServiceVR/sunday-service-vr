
import { describe, it, expect } from "vitest";
import { getDjStreamLinks, getLatestDjStreamLink } from "../store/djViewModel";
import { Dj, Event, Slot, EventSignup, SlotType, StreamSourceType, SlotDuration } from "../util/types";
import { mockDocRef } from "../test/mockDocRef";
import { DocumentReference } from "firebase/firestore";


describe("djViewModel", () => {
    const dj: Dj = { discord_id: "dj1", public_name: "DJ One", dj_name: "DJ One", roles: [], events: [], notes: [] };

    // Helper to create a minimal EventSignup
    const makeSignup = (stream_link: string = "https://twitch.tv/dj1"): EventSignup => ({
        uuid: "signup-uuid",
        name: "DJ One",
        requested_duration: 1 as SlotDuration,
        type: SlotType.LIVE,
        dj_refs: [mockDocRef("dj1") as unknown as DocumentReference],
        is_debut: false,
        event_signup_form_data: { event_id: "event-id", stream_link }
    });

    // Helper to create a minimal Slot
    const baseSlot = (overrides: Partial<Slot> = {}) => ({
        signup_uuid: "signup-uuid",
        stream_source_type: StreamSourceType.TWITCH,
        stream_source_url: "https://twitch.tv/dj1",
        start_time: new Date(),
        reconciled: {
            signup: makeSignup(overrides.reconciled?.signup?.event_signup_form_data?.stream_link ?? "https://twitch.tv/dj1")
        },
        djs: [{ discord_id: "dj1" }],
        duration: 1 as SlotDuration,
        is_live: true,
        dj_ref: mockDocRef("dj1") as unknown as DocumentReference,
        ...overrides
    });

    // Helper to create a minimal Event
    const makeEvent = (start_datetime: string, slotOverrides: Partial<Slot> = {}): Event => ({
        id: "event-id",
        name: "Event Name",
        published: true,
        message: "Event Message",
        start_datetime: new Date(start_datetime),
        end_datetime: new Date(start_datetime),
        host: "host-id",
        slots: [baseSlot(slotOverrides)],
        footer: "footer",
        signupsAreOpen: true,
        signups: [],
        dj_plays: [mockDocRef("dj1") as unknown as DocumentReference],
        lastUpdated: new Date(start_datetime)
    });


    it("returns unique stream links in most-recent-first order", () => {
        const events = [
            makeEvent("2023-01-01T10:00:00Z"),
            makeEvent("2023-01-02T10:00:00Z", { reconciled: { signup: makeSignup("https://twitch.tv/dj2") } }),
            makeEvent("2023-01-03T10:00:00Z", { reconciled: { signup: makeSignup("https://twitch.tv/dj1") } })
        ];
        const links = getDjStreamLinks(dj, events);
        expect(links).toEqual([
            "https://twitch.tv/dj1",
            "https://twitch.tv/dj2"
        ]);
    });


    it("returns the most recent stream link", () => {
        const events = [
            makeEvent("2023-01-01T10:00:00Z"),
            makeEvent("2023-01-02T10:00:00Z", { reconciled: { signup: makeSignup("https://twitch.tv/dj2") } }),
            makeEvent("2023-01-03T10:00:00Z", { reconciled: { signup: makeSignup("https://twitch.tv/dj1") } })
        ];
        const latest = getLatestDjStreamLink(dj, events);
        expect(latest).toBe("https://twitch.tv/dj1");
    });

    it("returns empty array if no events", () => {
        expect(getDjStreamLinks(dj, [])).toEqual([]);
    });

    it("returns undefined for latest link if no events", () => {
        expect(getLatestDjStreamLink(dj, [])).toBeUndefined();
    });

    it("ignores slots without the DJ", () => {
        const event = makeEvent("2023-01-01T10:00:00Z", { djs: [{ discord_id: "other" }] });
        expect(getDjStreamLinks(dj, [event])).toEqual([]);
    });

    it("ignores slots without a stream link", () => {
        const event = makeEvent("2023-01-01T10:00:00Z", { reconciled: { signup: makeSignup("") } });
        expect(getDjStreamLinks(dj, [event])).toEqual([]);
    });
});
