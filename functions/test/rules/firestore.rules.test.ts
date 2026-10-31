import { afterAll, beforeAll, describe, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HOST, PORTS } from "../../../tests/helpers/env";

describe("firestore.rules", () => {
  let env: RulesTestEnvironment;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: "rules-test",
      firestore: {
        host: HOST,
        port: PORTS.firestore,
        rules: readFileSync(resolve(__dirname, "../../../firestore.rules"), "utf8"),
      },
    });
  });

  afterAll(async () => {
    await env.clearFirestore();
    await env.cleanup();
  });

  const as = (roles: string[]) => env.authenticatedContext("u1", { roles }).firestore();

  it("denies unauthenticated reads", async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "events/e1")));
  });

  it("lets any signed-in user read events", async () => {
    await assertSucceeds(getDoc(doc(as(["dj"]), "events/e1")));
  });

  it("lets hosts and admins write events", async () => {
    await assertSucceeds(setDoc(doc(as(["host"]), "events/e1"), { name: "x" }));
    await assertSucceeds(setDoc(doc(as(["admin"]), "events/e2"), { name: "x" }));
  });

  it("denies DJs writing events", async () => {
    await assertFails(setDoc(doc(as(["dj"]), "events/e3"), { name: "x" }));
  });
});
