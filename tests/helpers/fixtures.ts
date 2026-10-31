import "./env";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { HOST, PORTS, PROJECT_ID } from "./env";

const app = getApps()[0] ?? initializeApp({ projectId: PROJECT_ID });
export const db = getFirestore(app);
export { Timestamp, FieldValue };

export type TestUser = {
  /** Firestore djs/{uid} doc id; also the Firebase Auth uid. */
  uid: string;
  discord_id: string;
  roles: string[];
  dj_name: string;
};

/** Users created by scripts/seed.mjs. */
export const SEED_USERS = {
  admin: { uid: "seed-admin", discord_id: "admin-1", roles: ["admin"], dj_name: "DJ Admin" },
  host: { uid: "seed-host", discord_id: "host-1", roles: ["host"], dj_name: "DJ Host" },
  dj1: { uid: "seed-dj-1", discord_id: "dj-1", roles: ["dj"], dj_name: "DJ One" },
  dj2: { uid: "seed-dj-2", discord_id: "dj-2", roles: ["dj"], dj_name: "DJ Two" },
  bingo: { uid: "seed-bingo", discord_id: "bingo-1", roles: ["bingo"], dj_name: "Bingo Player" },
} satisfies Record<string, TestUser>;

const uniq = () => randomUUID().slice(0, 8);

/** Creates a throwaway DJ (doc + user) so tests never depend on or mutate shared seed users. */
export async function createDj(name = `Test DJ ${uniq()}`): Promise<TestUser> {
  const id = `test-dj-${uniq()}`;
  const user: TestUser = { uid: id, discord_id: `discord-${id}`, roles: ["dj"], dj_name: name };
  await db.collection("djs").doc(id).set({
    discord_id: user.discord_id,
    public_name: name,
    dj_name: name,
    roles: [{ role: "dj" }],
  });
  return user;
}

/** Mints a custom token (uid = DJ doc id, claims as the real Discord login) and exchanges it for an ID token. */
export async function mintCustomToken(user: TestUser): Promise<string> {
  return getAuth(app).createCustomToken(user.uid, { roles: user.roles, discord_id: user.discord_id });
}

export async function idTokenFor(user: TestUser): Promise<string> {
  const customToken = await mintCustomToken(user);
  const res = await fetch(
    `http://${HOST}:${PORTS.auth}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  if (!res.ok) throw new Error(`Custom token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).idToken as string;
}

export type SignupInput = { dj: TestUser; name?: string };

const signupFor = ({ dj, name }: SignupInput) => ({
  uuid: randomUUID(),
  dj_refs: [db.collection("djs").doc(dj.uid)],
  name: name ?? dj.dj_name,
  requested_duration: 60,
  type: "LIVE",
  event_signup_form_data: {
    name: name ?? dj.dj_name,
    requested_duration: 60,
    type: "LIVE",
    is_b2b: false,
    available_from: "any",
    available_to: "any",
  },
});

export async function createEvent(opts: {
  name?: string;
  signupsAreOpen?: boolean;
  signups?: SignupInput[];
  start?: Date;
  host?: string;
} = {}): Promise<{ id: string; name: string }> {
  const name = opts.name ?? `Test Event ${uniq()}`;
  const start = opts.start ?? new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const ref = await db.collection("events").add({
    name,
    start_datetime: Timestamp.fromDate(start),
    end_datetime: Timestamp.fromDate(new Date(start.getTime() + 4 * 3600 * 1000)),
    host: opts.host ?? "Test Host",
    signupsAreOpen: opts.signupsAreOpen ?? true,
    signups: (opts.signups ?? []).map(signupFor),
    slots: [],
    dj_plays: [],
  });
  return { id: ref.id, name };
}

export async function createHost(name = `Test Host ${uniq()}`): Promise<{ id: string; name: string }> {
  const ref = await db.collection("hosts").add({ host_name: name });
  return { id: ref.id, name };
}

export async function findHostsByName(name: string) {
  const snap = await db.collection("hosts").where("host_name", "==", name).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; host_poster_url?: string }[];
}

export async function deleteHostsByName(name: string) {
  const snap = await db.collection("hosts").where("host_name", "==", name).get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
}

export async function getEvent(id: string) {
  const snap = await db.collection("events").doc(id).get();
  return snap.exists ? snap.data()! : undefined;
}

export async function deleteEvent(id: string) {
  await db.collection("events").doc(id).delete();
}

export async function deleteDj(user: TestUser) {
  await db.collection("djs").doc(user.uid).delete();
}

export async function deleteEventsByName(name: string) {
  const snap = await db.collection("events").where("name", "==", name).get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
}

/** Seed host user must exist; fails with a hint if seeding hasn't run. */
export async function assertSeeded() {
  const snap = await db.collection("djs").doc(SEED_USERS.host.uid).get();
  if (!snap.exists) throw new Error('Seed data missing. Run "npm run dev" in webapp/ and wait for seeding to finish.');
}
