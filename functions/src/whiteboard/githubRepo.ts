/**
 * Minimal GitHub Git Data API client, just enough to commit several files
 * to a branch in a single commit.
 */

const API_ROOT = process.env.GITHUB_API_ROOT ?? "https://api.github.com";
const MAX_COMMIT_ATTEMPTS = 3;

export type RepoFile = {
    path: string;
    content: Buffer;
};

/**
 * Thrown for non-2xx GitHub responses.
 */
class GithubApiError extends Error {
    /**
     * @param {number} status HTTP status
     * @param {string} message Error message
     */
    constructor(public status: number, message: string) {
        super(message);
    }
}

/**
 * A single GitHub repository branch we can read from and commit to.
 */
export class GithubRepo {
    /**
     * @param {string} owner Repo owner
     * @param {string} repo Repo name
     * @param {string} branch Branch to read/commit to
     * @param {string} token Fine-grained PAT with "Contents: read and write" on the repo
     */
    constructor(
        private owner: string,
        private repo: string,
        private branch: string,
        private token: string
    ) {}

    /**
     * Reads a file from the branch.
     * @param {string} path Path within the repo
     * @return {Buffer} File bytes
     */
    async getFile(path: string): Promise<Buffer> {
        const response = await this.fetchRaw(
            "GET",
            `/contents/${path}?ref=${encodeURIComponent(this.branch)}`,
            undefined,
            "application/vnd.github.raw+json"
        );
        return Buffer.from(await response.arrayBuffer());
    }

    /**
     * Commits the given files to the branch in one commit.
     * @param {RepoFile[]} files Files to write
     * @param {string} message Commit message
     * @return {boolean} true if a commit was made, false if nothing changed
     */
    async commitFiles(files: RepoFile[], message: string): Promise<boolean> {
        for (let attempt = 1; ; attempt++) {
            try {
                return await this.commitFilesOnce(files, message);
            } catch (error) {
                // 422 on the ref update means someone else moved the branch; retry on the new head.
                const isRaceLost = error instanceof GithubApiError && error.status === 422;
                if (!isRaceLost || attempt >= MAX_COMMIT_ATTEMPTS) {
                    throw error;
                }
            }
        }
    }

    /**
     * @param {RepoFile[]} files Files to write
     * @param {string} message Commit message
     * @return {boolean} true if a commit was made
     */
    private async commitFilesOnce(files: RepoFile[], message: string): Promise<boolean> {
        const ref = await this.json<{ object: { sha: string } }>(
            "GET", `/git/ref/heads/${this.branch}`
        );
        const parentSha = ref.object.sha;

        const parentCommit = await this.json<{ tree: { sha: string } }>(
            "GET", `/git/commits/${parentSha}`
        );

        const tree = await Promise.all(files.map(async (file) => {
            const blob = await this.json<{ sha: string }>("POST", "/git/blobs", {
                content: file.content.toString("base64"),
                encoding: "base64",
            });
            return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
        }));

        const newTree = await this.json<{ sha: string }>("POST", "/git/trees", {
            base_tree: parentCommit.tree.sha,
            tree,
        });

        if (newTree.sha === parentCommit.tree.sha) {
            return false;
        }

        const commit = await this.json<{ sha: string }>("POST", "/git/commits", {
            message,
            tree: newTree.sha,
            parents: [parentSha],
        });

        await this.json("PATCH", `/git/refs/heads/${this.branch}`, {
            sha: commit.sha,
            force: false,
        });

        return true;
    }

    /**
     * @param {string} method HTTP method
     * @param {string} path Path relative to the repo
     * @param {unknown} body Optional JSON body
     * @return {T} Parsed JSON response
     */
    private async json<T>(method: string, path: string, body?: unknown): Promise<T> {
        const response = await this.fetchRaw(method, path, body);
        return await response.json() as T;
    }

    /**
     * @param {string} method HTTP method
     * @param {string} path Path relative to the repo
     * @param {unknown} body Optional JSON body
     * @param {string} accept Accept header
     * @return {Response} The (successful) response
     */
    private async fetchRaw(
        method: string,
        path: string,
        body?: unknown,
        accept = "application/vnd.github+json"
    ): Promise<Response> {
        const response = await fetch(`${API_ROOT}/repos/${this.owner}/${this.repo}${path}`, {
            method,
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Accept": accept,
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "sunday-service-vr-whiteboard-sync",
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(30_000),
        });

        if (!response.ok) {
            const detail = await response.text();
            throw new GithubApiError(
                response.status,
                `GitHub ${method} ${path} failed: ${response.status} ${detail.slice(0, 300)}`
            );
        }
        return response;
    }
}
