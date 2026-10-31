import { logger } from "firebase-functions/v2";
import * as sharpModule from "sharp";

// Without esModuleInterop, the CommonJS module itself is the callable function.
const sharp = sharpModule as unknown as typeof sharpModule.default;
import { Event } from "../../../webapp/src/util/types";
import { GithubRepo, RepoFile } from "./githubRepo";
import { getLineupText, timeFormats, PLACEHOLDER_TEXT } from "./messageWriters";

const REPO_OWNER = "SundayServiceVR";
const REPO_NAME = "whiteboard";
const REPO_BRANCH = "master";

const DEFAULT_POSTER_PATH = "assets/S4-Default-Normal.png";

const FILE_GMT = "TimesGMT.txt";
const FILE_AU = "TimesAU.txt";
const FILE_LINEUP_POSTER = "lineup_poster.png";
const FILE_HOST_POSTER = "host_poster.png";

const IMAGE_DOWNLOAD_TIMEOUT_MS = 20_000;

export type WhiteboardUpdateResult = {
    // "dry-run" is returned in the emulator, where nothing is pushed to GitHub.
    status: "updated" | "unchanged" | "dry-run";
    // True if a poster could not be downloaded and the default poster was used instead.
    posterFallback: boolean;
};

type PosterResult = {
    png: Buffer;
    // True if we fell back to the default poster because the download failed
    // (as opposed to there being no poster configured).
    degraded: boolean;
};

/**
 * Downloads an image and normalises it to PNG.  Returns null on any failure.
 * @param {string} url Image URL
 * @return {Buffer} PNG bytes, or null on failure
 */
async function downloadAsPng(url: string): Promise<Buffer | null> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(IMAGE_DOWNLOAD_TIMEOUT_MS) });
        if (!response.ok) {
            logger.warn(`Poster download failed: ${response.status} ${url}`);
            return null;
        }
        return await sharp(Buffer.from(await response.arrayBuffer())).png().toBuffer();
    } catch (error) {
        logger.warn(`Poster download/convert failed for ${url}`, error);
        return null;
    }
}

/**
 * @param {string} url Poster URL, if the event has one
 * @param {Function} getDefault Loads the default poster as PNG
 * @return {PosterResult} Poster PNG
 */
async function resolvePoster(url: string | undefined, getDefault: () => Promise<Buffer>): Promise<PosterResult> {
    if (!url) {
        return { png: await getDefault(), degraded: false };
    }
    const png = await downloadAsPng(url);
    return png ?
        { png, degraded: false } :
        { png: await getDefault(), degraded: true };
}

/**
 * @param {GithubRepo} repo The whiteboard repo
 * @return {Function} Loads (once) the default poster from the repo as PNG
 */
function defaultPosterLoader(repo: GithubRepo): () => Promise<Buffer> {
    let defaultPoster: Promise<Buffer> | undefined;
    return () => defaultPoster ??= repo.getFile(DEFAULT_POSTER_PATH)
        .then((bytes) => sharp(bytes).png().toBuffer());
}

/**
 * Resets the whiteboard to the placeholder text and default posters.
 *
 * @param {string} githubToken PAT with contents write access to the whiteboard repo
 * @return {WhiteboardUpdateResult} What happened
 */
export async function clearWhiteboard(githubToken: string): Promise<WhiteboardUpdateResult> {
    if (process.env.FUNCTIONS_EMULATOR === "true") {
        logger.info("Emulator detected, skipping clear of GitHub whiteboard.");
        return { status: "dry-run", posterFallback: false };
    }

    const repo = new GithubRepo(REPO_OWNER, REPO_NAME, REPO_BRANCH, githubToken);
    const poster = await defaultPosterLoader(repo)();
    const placeholder = Buffer.from(PLACEHOLDER_TEXT.trim());

    const committed = await repo.commitFiles([
        { path: FILE_GMT, content: placeholder },
        { path: FILE_AU, content: placeholder },
        { path: FILE_LINEUP_POSTER, content: poster },
        { path: FILE_HOST_POSTER, content: poster },
    ], "chore: clear board");

    return { status: committed ? "updated" : "unchanged", posterFallback: false };
}

/**
 * Pushes the given event's lineup text and posters to the whiteboard repo.
 *
 * @param {Event} event The event to show on the board
 * @param {string} githubToken PAT with contents write access to the whiteboard repo
 * @return {WhiteboardUpdateResult} What happened
 */
export async function pushEventToWhiteboard(event: Event, githubToken: string): Promise<WhiteboardUpdateResult> {
    if (process.env.FUNCTIONS_EMULATOR === "true") {
        logger.info("Emulator detected, skipping push to GitHub.", { eventId: event.id });
        return { status: "dry-run", posterFallback: false };
    }

    const repo = new GithubRepo(REPO_OWNER, REPO_NAME, REPO_BRANCH, githubToken);
    const getDefault = defaultPosterLoader(repo);

    const [lineupPoster, hostPoster] = await Promise.all([
        resolvePoster(event.lineup_poster_url, getDefault),
        resolvePoster(event.reconciled?.host?.host_poster_url, getDefault),
    ]);

    const files: RepoFile[] = [
        { path: FILE_GMT, content: Buffer.from(getLineupText(event, timeFormats.GMT).trim()) },
        { path: FILE_AU, content: Buffer.from(getLineupText(event, timeFormats.AU).trim()) },
        { path: FILE_LINEUP_POSTER, content: lineupPoster.png },
        { path: FILE_HOST_POSTER, content: hostPoster.png },
    ];

    const committed = await repo.commitFiles(files, `chore: update board for ${event.name} (${event.id})`);
    logger.info(committed ? "Pushed whiteboard update." : "Whiteboard repo already had this content.", {
        eventId: event.id,
    });

    return {
        status: committed ? "updated" : "unchanged",
        posterFallback: lineupPoster.degraded || hostPoster.degraded,
    };
}
