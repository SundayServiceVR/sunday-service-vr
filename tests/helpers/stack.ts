import { HOST, MOCK_GITHUB_URL, PORTS, WEBAPP_URL } from "./env";

const probe = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
};

/** Fails fast with a helpful message if the local stack (`npm run dev` in webapp/) is not up. */
export async function assertStackIsUp(opts: { webapp: boolean }) {
  const checks: [string, string][] = [
    ["Firestore emulator", `http://${HOST}:${PORTS.firestore}`],
    ["Auth emulator", `http://${HOST}:${PORTS.auth}`],
    ["Functions emulator", `http://${HOST}:${PORTS.functions}`],
    ["Mock GitHub", `${MOCK_GITHUB_URL}/__state`],
  ];
  if (opts.webapp) checks.push(["Webapp", WEBAPP_URL]);

  const down: string[] = [];
  for (const [name, url] of checks) {
    if (!(await probe(url))) down.push(name);
  }
  if (down.length) {
    throw new Error(
      `Local stack is not running (${down.join(", ")}). Start it with "npm run dev" in sunday-service-vr/webapp, ` +
        `wait until seeding finishes, then re-run the tests.`
    );
  }
}
