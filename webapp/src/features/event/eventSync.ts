/**
 * Pure decision logic for how EventRoot reacts to a snapshot arriving from
 * Firestore. Kept free of React/Firebase so the rules can be unit tested.
 */
export type IncomingEventInput = {
    hasLocalChanges: boolean;
    /** Session id stamped on the incoming document by whoever last saved it. */
    incomingSavedBy?: string;
    /** Session id of this browser tab. */
    localSessionId: string;
    incomingUpdatedAt: number | null;
    lastSeenUpdatedAt: number | null;
};

export type IncomingEventDecision = {
    /** Replace the editable scratchpad with the incoming event. */
    adoptIntoScratchpad: boolean;
    /** Tell the user someone else changed the event while they had edits. */
    notifyExternalChange: boolean;
};

export const decideIncomingEvent = (input: IncomingEventInput): IncomingEventDecision => {
    const isOwnEcho = input.incomingSavedBy !== undefined && input.incomingSavedBy === input.localSessionId;

    if (isOwnEcho) {
        // Our own save coming back. Never clobber edits made since we saved.
        return { adoptIntoScratchpad: !input.hasLocalChanges, notifyExternalChange: false };
    }

    const isNewer =
        input.lastSeenUpdatedAt !== null &&
        input.incomingUpdatedAt !== null &&
        input.incomingUpdatedAt > input.lastSeenUpdatedAt;

    return { adoptIntoScratchpad: true, notifyExternalChange: input.hasLocalChanges && isNewer };
};
