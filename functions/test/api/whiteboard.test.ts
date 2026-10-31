import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { functionUrl } from "../../../tests/helpers/env";
import { assertSeeded, createDj, createEvent, deleteDj, deleteEvent, idTokenFor, SEED_USERS, TestUser } from "../../../tests/helpers/fixtures";
import { commitCount, readBoardFile, resetMockGithub } from "../../../tests/helpers/mockGithub";

const call = (fn: string, token?: string, body?: unknown) =>
  fetch(functionUrl(fn), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body ?? {}),
  });

describe("updateWhiteboard / clearWhiteboard", () => {
  const cleanup: (() => Promise<void>)[] = [];
  let dj: TestUser;

  beforeAll(async () => {
    await assertSeeded();
    dj = await createDj("Whiteboard Test DJ");
    cleanup.push(() => deleteDj(dj));
  });

  beforeEach(resetMockGithub);

  afterAll(async () => {
    await Promise.all(cleanup.map((fn) => fn()));
  });

  it("rejects missing token (401) and non-host roles (403)", async () => {
    expect((await call("updateWhiteboard", undefined, { eventId: "x" })).status).toBe(401);
    expect((await call("updateWhiteboard", await idTokenFor(SEED_USERS.dj1), { eventId: "x" })).status).toBe(403);
    expect((await call("clearWhiteboard", await idTokenFor(SEED_USERS.dj1))).status).toBe(403);
    expect(await commitCount()).toBe(0);
  });

  it("validates input (400) and unknown events (404)", async () => {
    const token = await idTokenFor(SEED_USERS.host);
    expect((await call("updateWhiteboard", token, {})).status).toBe(400);
    expect((await call("updateWhiteboard", token, { eventId: "does-not-exist" })).status).toBe(404);
  });

  it("pushes the lineup to the board once, then reports unchanged", async () => {
    const event = await createEvent({ name: "Board Test Event", signups: [{ dj }] });
    cleanup.push(() => deleteEvent(event.id));
    const { db, Timestamp } = await import("../../../tests/helpers/fixtures");
    await db.collection("events").doc(event.id).update({
      slots: [{ start_time: Timestamp.fromDate(new Date("2030-01-06T20:00:00Z")), reconciled: { signup: { name: dj.dj_name } }, name: dj.dj_name }],
    });

    const token = await idTokenFor(SEED_USERS.host);

    const first = await call("updateWhiteboard", token, { eventId: event.id });
    expect(first.status).toBe(200);
    expect((await first.json()).status).toBe("updated");
    expect(await commitCount()).toBe(1);
    expect(await readBoardFile("TimesGMT.txt")).toContain(dj.dj_name);

    const second = await call("updateWhiteboard", token, { eventId: event.id });
    expect((await second.json()).status).toBe("unchanged");
    expect(await commitCount()).toBe(1);
  });

  it("clearWhiteboard resets the board text", async () => {
    const token = await idTokenFor(SEED_USERS.host);
    const res = await call("clearWhiteboard", token);
    expect(res.status).toBe(200);
    expect(await readBoardFile("TimesGMT.txt")).not.toContain("Whiteboard Test DJ");
  });
});
