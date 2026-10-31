import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { functionUrl } from "../../../tests/helpers/env";
import { assertSeeded, createDj, createEvent, deleteDj, deleteEvent, getEvent, idTokenFor, SEED_USERS, TestUser } from "../../../tests/helpers/fixtures";

const post = (token: string | undefined, body: unknown) =>
  fetch(functionUrl("eventSignupIntake"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

const formFor = (event_id: string, name: string) => ({
  event_id,
  name,
  requested_duration: 60,
  type: "LIVE",
  is_b2b: false,
  available_from: "any",
  available_to: "any",
});

describe("eventSignupIntake", () => {
  let dj: TestUser;
  let eventId: string;

  beforeAll(async () => {
    await assertSeeded();
    dj = await createDj();
    eventId = (await createEvent({ signupsAreOpen: true })).id;
  });

  afterAll(async () => {
    await deleteEvent(eventId);
    await deleteDj(dj);
  });

  it("rejects a request with no token (401)", async () => {
    const res = await post(undefined, formFor(eventId, "x"));
    expect(res.status).toBe(401);
  });

  it("rejects a user without the dj role (403)", async () => {
    const res = await post(await idTokenFor(SEED_USERS.bingo), formFor(eventId, "x"));
    // The bingo seed user has a DJ doc but no dj role.
    expect(res.status).toBe(403);
  });

  it("returns 404 for an unknown event", async () => {
    const res = await post(await idTokenFor(dj), formFor("does-not-exist", "x"));
    expect(res.status).toBe(404);
  });

  it("creates a signup (201), then updates it in place (200)", async () => {
    const token = await idTokenFor(dj);

    const created = await post(token, formFor(eventId, "First Name"));
    expect(created.status).toBe(201);

    const updated = await post(token, formFor(eventId, "Second Name"));
    expect(updated.status).toBe(200);

    const event = await getEvent(eventId);
    expect(event?.signups).toHaveLength(1);
    expect(event?.signups[0].name).toBe("Second Name");
    expect(event?.signups[0].dj_refs[0].path).toBe(`djs/${dj.uid}`);
  });
});
