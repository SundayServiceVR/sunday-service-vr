import { expect, Page } from "@playwright/test";
import { functionUrl } from "../../helpers/env";
import { idTokenFor, mintCustomToken, TestUser } from "../../helpers/fixtures";

/** Signs the browser in as `user` via the emulator-only token hook (skips the Discord redirect). */
export async function loginAs(page: Page, user: TestUser) {
  const token = await mintCustomToken(user);
  await page.goto("/login");
  await page.waitForFunction(() => typeof (window as any).__signInWithCustomToken === "function");
  await page.evaluate((t) => (window as any).__signInWithCustomToken(t), token);
}

/** Host fills in the create-event form with signups open and submits it. Returns the new event id. */
export async function createEventViaUi(page: Page, name: string): Promise<string> {
  await page.goto("/events/create");
  await page.getByTestId("event-name").fill(name);
  await page.getByTestId("event-host").fill("Test Host");
  await page.getByTestId("event-signups-open").check();
  await page.getByRole("button", { name: "Create Event" }).click();
  await page.waitForURL(/\/events\/(?!create(\/|$))[^/]+/, { timeout: 15_000 });
  return new URL(page.url()).pathname.split("/")[2];
}

/** DJ walks through the signup wizard. */
export async function completeSignupWizard(page: Page, eventId: string) {
  await page.goto(`/eventSignup/${eventId}`);
  await page.getByRole("link", { name: "Get Started" }).click();

  // Step 1: performer info (name is prefilled from the DJ record)
  await page.getByLabel("How long will your performance be?").selectOption("1");
  await page.getByRole("button", { name: "Next" }).click();
  // Step 2: availability (defaults to any time)
  await page.getByRole("button", { name: "Next" }).click();
  // Step 3: stream details
  await page.getByLabel("Live or Prerecord").selectOption("LIVE");
  await page.locator("#stream_link").fill("https://example.com/stream");
  await page.getByRole("button", { name: "Next" }).click();
  // Step 4: confirmation
  await page.getByLabel("I Understand the expectations of a performer.").check();
  await page.getByRole("button", { name: "Submit" }).click();
}

/** Fast path for a DJ's signup: posts to the same function the wizard uses. */
export async function signUpViaApi(dj: TestUser, eventId: string) {
  const res = await fetch(functionUrl("eventSignupIntake"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await idTokenFor(dj)}` },
    body: JSON.stringify({
      event_id: eventId,
      name: dj.dj_name,
      requested_duration: 1,
      type: "LIVE",
      is_b2b: false,
      available_from: "any",
      available_to: "any",
      stream_link: "https://example.com/stream",
    }),
  });
  if (res.status !== 201) throw new Error(`Signup failed: ${res.status} ${await res.text()}`);
}

/** Closes signups, adds every signup to the lineup, and saves. */
export async function closeSignupsAndBuildLineup(page: Page, eventId: string, expectedSlots: number) {
  await page.goto(`/events/${eventId}/lineup`);
  await page.getByRole("button", { name: "Build Lineup" }).click();

  await page.getByLabel("Signups Open").uncheck();

  const add = page.getByRole("button", { name: /Add to Lineup/ });
  for (let remaining = expectedSlots; remaining > 0; remaining--) {
    await expect(add).toHaveCount(remaining);
    await add.first().click();
  }
  await expect(add).toHaveCount(0);

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeHidden();
}

export async function updateBoard(page: Page, eventId: string) {
  await page.goto(`/events/${eventId}/preflight`);
  await page.getByRole("button", { name: "Update board" }).click();
  await expect(page.getByText("Board updated!")).toBeVisible({ timeout: 30_000 });
}
