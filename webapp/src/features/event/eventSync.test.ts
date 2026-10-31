import { decideIncomingEvent } from "./eventSync";

const base = { localSessionId: "me", incomingUpdatedAt: 200, lastSeenUpdatedAt: 100 };

describe("decideIncomingEvent", () => {
    it("adopts own echo when there are no newer local edits", () => {
        expect(decideIncomingEvent({ ...base, hasLocalChanges: false, incomingSavedBy: "me" }))
            .toEqual({ adoptIntoScratchpad: true, notifyExternalChange: false });
    });

    it("keeps newer local edits when our own save echoes back", () => {
        expect(decideIncomingEvent({ ...base, hasLocalChanges: true, incomingSavedBy: "me" }))
            .toEqual({ adoptIntoScratchpad: false, notifyExternalChange: false });
    });

    it("adopts external changes silently when there are no local edits", () => {
        expect(decideIncomingEvent({ ...base, hasLocalChanges: false, incomingSavedBy: "other" }))
            .toEqual({ adoptIntoScratchpad: true, notifyExternalChange: false });
    });

    it("warns when an external change replaces local edits", () => {
        expect(decideIncomingEvent({ ...base, hasLocalChanges: true, incomingSavedBy: "other" }))
            .toEqual({ adoptIntoScratchpad: true, notifyExternalChange: true });
    });

    it("treats documents with no saver as external", () => {
        expect(decideIncomingEvent({ ...base, hasLocalChanges: true }).adoptIntoScratchpad).toBe(true);
    });
});
