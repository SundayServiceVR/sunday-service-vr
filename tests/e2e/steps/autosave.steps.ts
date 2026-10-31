import { expect, Page } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import { getEvent } from "../../helpers/fixtures";
import { commitCount } from "../../helpers/mockGithub";

const AUTOSAVE_DELAY_MS = 2000;

When("I open the event setup", async ({ page, world }) => {
  world.eventName = (await getEvent(world.eventId!))?.name;
  await page.goto(`/events/${world.eventId}/setup`);
  await expect(page.getByTestId("event-name")).toHaveValue(world.eventName!);
});

/** The autosave switch lives in the user menu (top right); open it if needed. */
async function autosaveToggle(page: Page) {
  const toggle = page.getByTestId("autosave-toggle");
  if (!(await toggle.isVisible())) await page.locator(".navbar .dropdown-toggle").click();
  await expect(toggle).toBeVisible();
  return toggle;
}

Then("autosave is off", async ({ page }) => {
  await expect(await autosaveToggle(page)).not.toBeChecked();
});

Then("autosave is on", async ({ page }) => {
  await expect(await autosaveToggle(page)).toBeChecked();
});

When("I turn on autosave", async ({ page }) => {
  await (await autosaveToggle(page)).check();
});

When("I rename the event to {string}", async ({ page }, name: string) => {
  await page.getByTestId("event-name").fill(name);
});

When("I rename the event to {string} and leave the field", async ({ page }, name: string) => {
  await page.getByTestId("event-name").fill(name);
  await page.getByTestId("event-name").blur();
});

When("I wait for longer than the autosave delay", async ({ page }) => {
  await page.waitForTimeout(AUTOSAVE_DELAY_MS + 1000);
});

When("I click Save", async ({ page }) => {
  await page.getByRole("button", { name: "Save", exact: true }).click();
});

When("I reload the page", async ({ page }) => {
  await page.reload();
});

Then("the stored event name is unchanged", async ({ world }) => {
  expect((await getEvent(world.eventId!))?.name).toBe(world.eventName);
});

Then("the stored event name is {string}", async ({ world }, name: string) => {
  await expect.poll(async () => (await getEvent(world.eventId!))?.name).toBe(name);
});

Then("the stored event name becomes {string}", async ({ world }, name: string) => {
  await expect.poll(async () => (await getEvent(world.eventId!))?.name, { timeout: 10_000 }).toBe(name);
});

Then("the stored event name becomes {string} within 1 second", async ({ world }, name: string) => {
  await expect.poll(async () => (await getEvent(world.eventId!))?.name, { timeout: 1_000 }).toBe(name);
});

Then("the save status says {string}", async ({ page }, text: string) => {
  await expect(page.getByTestId("save-status")).toContainText(text);
});

Then("there is no Save button", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);
});

Then("no whiteboard update was made", async () => {
  expect(await commitCount()).toBe(0);
});
