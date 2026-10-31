// Minimal in-memory mock of the GitHub Git Data API used by functions/src/whiteboard/githubRepo.ts.
// Usage: node scripts/mock-github.mjs   (port: MOCK_GITHUB_PORT, default 4600)
//
// Test endpoints:
//   GET  /__state  -> { head, commits: [{sha, message, parents, files}], files: { path: base64 } }
//   POST /__reset  -> back to the initial repo state
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.MOCK_GITHUB_PORT ?? 4600);
const BRANCH = "master";

// 1x1 PNG, used as the default poster and (so sharp can decode it) any poster fetched via the API.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

const sha = (...parts) => {
  const h = crypto.createHash("sha1");
  parts.forEach((p) => h.update(p));
  return h.digest("hex");
};

let blobs, trees, commits, head;

const reset = () => {
  blobs = new Map(); // sha -> Buffer
  trees = new Map(); // sha -> { path: blobSha }
  commits = new Map(); // sha -> { message, tree, parents }
  const put = (buf) => { const s = sha("blob", buf); blobs.set(s, buf); return s; };
  const placeholder = Buffer.from("Sunday Service\n\nEvery Sunday");
  const files = {
    "TimesGMT.txt": put(placeholder),
    "TimesAU.txt": put(placeholder),
    "lineup_poster.png": put(PNG_1X1),
    "host_poster.png": put(PNG_1X1),
    "assets/S4-Default-Normal.png": put(PNG_1X1),
  };
  const treeSha = sha("tree", JSON.stringify(Object.entries(files).sort()));
  trees.set(treeSha, files);
  head = sha("commit", "initial");
  commits.set(head, { message: "initial", tree: treeSha, parents: [] });
};
reset();

const readBody = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined));
});

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "Content-Type": type });
  res.end(Buffer.isBuffer(body) || typeof body === "string" ? body : JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const body = await readBody(req);

  try {
    if (p === "/__reset" && req.method === "POST") { reset(); return send(res, 200, { ok: true }); }

    if (p === "/__state" && req.method === "GET") {
      const describe = (s) => ({ sha: s, ...commits.get(s), files: Object.fromEntries(
        Object.entries(trees.get(commits.get(s).tree)).map(([path, b]) => [path, blobs.get(b).toString("base64")])) });
      const list = [];
      for (let s = head; s; s = commits.get(s).parents[0]) list.push(describe(s));
      return send(res, 200, { head, commits: list, files: list[0].files });
    }

    const m = p.match(/^\/repos\/[^/]+\/[^/]+\/(.*)$/);
    if (!m) return send(res, 404, { message: "Not Found" });
    const rest = m[1];

    if (req.method === "GET" && rest === `git/ref/heads/${BRANCH}`) {
      return send(res, 200, { object: { sha: head } });
    }
    let g;
    if (req.method === "GET" && (g = rest.match(/^git\/commits\/(.+)$/))) {
      const c = commits.get(g[1]);
      return c ? send(res, 200, { sha: g[1], tree: { sha: c.tree } }) : send(res, 404, { message: "Not Found" });
    }
    if (req.method === "POST" && rest === "git/blobs") {
      const buf = Buffer.from(body.content, body.encoding === "base64" ? "base64" : "utf8");
      const s = sha("blob", buf);
      blobs.set(s, buf);
      return send(res, 201, { sha: s });
    }
    if (req.method === "POST" && rest === "git/trees") {
      const entries = { ...(trees.get(body.base_tree) ?? {}) };
      for (const t of body.tree) entries[t.path] = t.sha;
      const s = sha("tree", JSON.stringify(Object.entries(entries).sort()));
      trees.set(s, entries);
      return send(res, 201, { sha: s });
    }
    if (req.method === "POST" && rest === "git/commits") {
      const s = sha("commit", JSON.stringify(body), String(commits.size));
      commits.set(s, { message: body.message, tree: body.tree, parents: body.parents });
      return send(res, 201, { sha: s });
    }
    if (req.method === "PATCH" && rest === `git/refs/heads/${BRANCH}`) {
      if (commits.get(body.sha)?.parents[0] !== head) return send(res, 422, { message: "Update is not a fast forward" });
      head = body.sha;
      return send(res, 200, { object: { sha: head } });
    }
    if (req.method === "GET" && (g = rest.match(/^contents\/(.+)$/))) {
      const blobSha = trees.get(commits.get(head).tree)[decodeURIComponent(g[1])];
      return blobSha ? send(res, 200, blobs.get(blobSha), "application/octet-stream") : send(res, 404, { message: "Not Found" });
    }
    send(res, 404, { message: `Unhandled ${req.method} ${p}` });
  } catch (error) {
    send(res, 500, { message: String(error) });
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`Mock GitHub listening on http://127.0.0.1:${PORT}`));
