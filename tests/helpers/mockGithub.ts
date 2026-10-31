import { MOCK_GITHUB_URL } from "./env";

export type MockGithubState = {
  head: string;
  commits: { sha: string; message: string; parents: string[]; files: Record<string, string> }[];
  files: Record<string, string>;
};

export async function resetMockGithub() {
  const res = await fetch(`${MOCK_GITHUB_URL}/__reset`, { method: "POST" });
  if (!res.ok) throw new Error(`Mock GitHub reset failed: ${res.status}`);
}

export async function getMockGithubState(): Promise<MockGithubState> {
  return (await fetch(`${MOCK_GITHUB_URL}/__state`)).json() as Promise<MockGithubState>;
}

/** Decoded text of a file at the mock repo's head. */
export async function readBoardFile(path: string): Promise<string> {
  const state = await getMockGithubState();
  return Buffer.from(state.files[path] ?? "", "base64").toString("utf8");
}

/** Number of commits made since the initial one. */
export async function commitCount(): Promise<number> {
  return (await getMockGithubState()).commits.length - 1;
}
