import { auth } from "./firebase";
import { functionUrl as buildFunctionUrl, projectId } from "./config";

export type WhiteboardUpdateResult = {
    status: "updated" | "unchanged" | "dry-run";
    posterFallback: boolean;
};

const functionUrl = (name: string) =>
    buildFunctionUrl(name, `https://us-central1-${projectId}.cloudfunctions.net/${name}`);

const postAuthed = async (name: string, body: object): Promise<WhiteboardUpdateResult> => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
        throw new Error("You must be signed in to change the board.");
    }

    const response = await fetch(functionUrl(name), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Board request failed (${response.status}): ${await response.text()}`);
    }

    return await response.json() as WhiteboardUpdateResult;
};

/**
 * Asks the backend to push the given event's lineup and posters to the whiteboard repo.
 * @param eventId Id of the (already saved) event to show on the board
 */
export const updateWhiteboard = (eventId: string) => postAuthed("updateWhiteboard", { eventId });

/** Asks the backend to reset the whiteboard to placeholder text and default posters. */
export const clearWhiteboard = () => postAuthed("clearWhiteboard", {});

export type WhiteboardContents = {
    gmt: string;
    au: string;
    // Object URLs.  Call `URL.revokeObjectURL` when done.
    lineupPosterUrl: string;
    hostPosterUrl: string;
};

const CONTENTS_API = "https://api.github.com/repos/SundayServiceVR/whiteboard/contents";

const fetchRepoFile = async (path: string): Promise<Response> => {
    // The contents API is not served from the long-lived raw.githubusercontent.com CDN cache,
    // so this reflects what was just committed.
    const response = await fetch(`${CONTENTS_API}/${path}?ref=master`, {
        headers: { Accept: "application/vnd.github.raw+json" },
        cache: "no-store",
    });
    if (!response.ok) {
        throw new Error(`Could not load ${path} from the whiteboard (${response.status})`);
    }
    return response;
};

/** Reads the texts and posters currently committed to the whiteboard repo. */
export const fetchWhiteboardContents = async (): Promise<WhiteboardContents> => {
    const [gmt, au, lineupPoster, hostPoster] = await Promise.all([
        fetchRepoFile("TimesGMT.txt").then((r) => r.text()),
        fetchRepoFile("TimesAU.txt").then((r) => r.text()),
        fetchRepoFile("lineup_poster.png").then((r) => r.blob()),
        fetchRepoFile("host_poster.png").then((r) => r.blob()),
    ]);

    return {
        gmt,
        au,
        lineupPosterUrl: URL.createObjectURL(lineupPoster),
        hostPosterUrl: URL.createObjectURL(hostPoster),
    };
};
