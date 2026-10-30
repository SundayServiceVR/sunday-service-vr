import { auth } from "./firebase";

export type WhiteboardUpdateResult = {
    status: "updated" | "unchanged" | "dry-run";
    posterFallback: boolean;
};

/**
 * Asks the backend to push the given event's lineup and posters to the whiteboard repo.
 * @param eventId Id of the (already saved) event to show on the board
 */
export const updateWhiteboard = async (eventId: string): Promise<WhiteboardUpdateResult> => {
    const endpoint = process.env.NODE_ENV === "development"
        ? "http://localhost:5001/sunday-service-vr/us-central1/updateWhiteboard"
        : "https://updatewhiteboard-diczrrhb6a-uc.a.run.app/";

    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
        throw new Error("You must be signed in to update the board.");
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
        throw new Error(`Board update failed (${response.status}): ${await response.text()}`);
    }

    return await response.json() as WhiteboardUpdateResult;
};
