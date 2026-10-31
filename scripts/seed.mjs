// Seeds the local emulators with deterministic data.
// Usage: node scripts/seed.mjs   (run from sunday-service-vr/)
// Env:
//   SEED_ADMIN_DISCORD_ID  Your real Discord ID; seeded as admin so real Discord login has full access.
//   FIRESTORE_EMULATOR_HOST  Defaults to 127.0.0.1:8080.
// All events are in the past so workflows start with event creation.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import net from "node:net";
import path from "node:path";

const require = createRequire(path.join(path.dirname(fileURLToPath(import.meta.url)), "../functions/package.json"));
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.GCLOUD_PROJECT ??= "sunday-service-vr";

const waitForPort = async (hostPort, timeoutMs = 120_000) => {
  const [host, port] = hostPort.split(":");
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const s = net.connect(Number(port), host);
      s.once("connect", () => { s.destroy(); resolve(true); });
      s.once("error", () => resolve(false));
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${hostPort}`);
};

await waitForPort(process.env.FIRESTORE_EMULATOR_HOST);

initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const daysAgo = (days, hour = 20) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
};

// Stable users, one per role. The Discord ID doubles as the login identity.
const users = [
  { id: "seed-admin", discord_id: "admin-1", public_name: "Seed Admin", dj_name: "DJ Admin", roles: [{ role: "admin" }] },
  { id: "seed-host", discord_id: "host-1", public_name: "Seed Host", dj_name: "DJ Host", roles: [{ role: "host" }] },
  { id: "seed-dj-1", discord_id: "dj-1", public_name: "Seed DJ One", dj_name: "DJ One", roles: [{ role: "dj" }] },
  { id: "seed-dj-2", discord_id: "dj-2", public_name: "Seed DJ Two", dj_name: "DJ Two", roles: [{ role: "dj" }] },
  { id: "seed-bingo", discord_id: "bingo-1", public_name: "Seed Bingo", dj_name: "Bingo Player", roles: [{ role: "bingo" }] },
  { id: "seed-none", discord_id: "none-1", public_name: "Seed No Role", dj_name: "No Role", roles: [] },
];

if (process.env.SEED_ADMIN_DISCORD_ID) {
  users.push({
    id: "seed-me",
    discord_id: process.env.SEED_ADMIN_DISCORD_ID,
    public_name: "Me (admin)",
    dj_name: "Me",
    roles: [{ role: "admin" }, { role: "host" }, { role: "dj" }],
  });
}

for (const { id, ...user } of users) {
  await db.collection("djs").doc(id).set(user);
}

await db.doc("club/s4").set({});

const hostRef = db.collection("hosts").doc("seed-host-doc");
await hostRef.set({ host_name: "Seed Host", dj_ref: db.collection("djs").doc("seed-host") });

const djRef = (id) => db.collection("djs").doc(id);
const djs = [
  { id: "seed-dj-1", name: "DJ One", discord_id: "dj-1" },
  { id: "seed-dj-2", name: "DJ Two", discord_id: "dj-2" },
];

for (let i = 0; i < 3; i++) {
  const start = daysAgo(7 * (i + 1));
  const slots = djs.map((dj, j) => {
    const signup_uuid = `seed-signup-${i}-${j}`;
    return {
      signup_uuid,
      start_time: Timestamp.fromDate(new Date(start.getTime() + j * 3600_000)),
      duration: 1,
      dj_ref: djRef(dj.id),
      djs: [{ dj_name: dj.name, discord_id: dj.discord_id }],
      slot_type: "LIVE",
      stream_source_type: "VRCDN",
      reconciled: { signup: { uuid: signup_uuid, name: dj.name, requested_duration: 1, type: "LIVE", dj_refs: [djRef(dj.id)], is_debut: false } },
    };
  });

  await db.collection("events").doc(`seed-event-${i}`).set({
    name: `Seed Sunday Service ${i + 1}`,
    message: "Seeded event",
    host: "Seed Host",
    host_ref: hostRef,
    footer: "",
    start_datetime: Timestamp.fromDate(start),
    end_datetime: Timestamp.fromDate(new Date(start.getTime() + 2 * 3600_000)),
    signupsAreOpen: false,
    signups: slots.map((s) => s.reconciled.signup),
    slots,
    dj_plays: djs.map((dj) => djRef(dj.id)),
  });
}

console.log(`Seeded ${users.length} users, 1 host, 3 past events.`);
