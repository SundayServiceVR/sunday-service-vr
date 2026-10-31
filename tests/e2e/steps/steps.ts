import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import { createDj, createEvent, getEvent, SEED_USERS } from "../../helpers/fixtures";
import { readBoardFile } from "../../helpers/mockGithub";
import {
  closeSignupsAndBuildLineup,
  completeSignupWizard,
  createEventViaUi,
  loginAs,
  signUpViaApi,
  updateBoard,
} from "../support/actions";

// ---- Actors -------------------------------------------------------------------------------

Given("I am signed in as the host", async ({ page }) => {
  await loginAs(page, SEED_USERS.host);
});

Given("I am signed in as a new DJ", async ({ page, world }) => {
  const dj = await createDj();
  world.trackDj(dj);
  world.dj = dj;
  await loginAs(page, dj);
});

// ---- Events -------------------------------------------------------------------------------

Given("an event with signups open", async ({ world }) => {
  world.trackEvent((await createEvent({ signupsAreOpen: true })).id);
});

Given("an event with signups closed", async ({ world }) => {
  world.trackEvent((await createEvent({ signupsAreOpen: false })).id);
});

Given("an event with signups open from {string} and {string}", async ({ world }, first: string, second: string) => {
  const djs = [await createDj(first), await createDj(second)];
  djs.forEach((dj) => world.trackDj(dj));
  world.trackEvent((await createEvent({ signupsAreOpen: true, signups: djs.map((dj) => ({ dj })) })).id);
});

When("I create an event with signups open", async ({ page, world }) => {
  const name = `E2E Event ${Date.now()}`;
  world.trackEventName(name);
  world.eventId = await createEventViaUi(page, name);
});

Then("the event exists with signups open", async ({ world }) => {
  const event = await getEvent(world.eventId!);
  expect(event?.name).toBe(world.eventName);
  expect(event?.signupsAreOpen).toBe(true);
});

// ---- DJ signup ----------------------------------------------------------------------------

When("I complete the signup wizard", async ({ page, world }) => {
  await completeSignupWizard(page, world.eventId!);
});

When("I open the signup page for the event", async ({ page, world }) => {
  await page.goto(`/eventSignup/${world.eventId}`);
});

When("DJs {string} and {string} sign up", async ({ world }, first: string, second: string) => {
  for (const name of [first, second]) {
    const dj = await createDj(name);
    world.trackDj(dj);
    await signUpViaApi(dj, world.eventId!);
  }
});

Then("I see that I am signed up", async ({ page }) => {
  await expect(page.getByText(/You are signed up for/)).toBeVisible();
});

Then("the event has {int} signup from me", async ({ world }, count: number) => {
  const event = await getEvent(world.eventId!);
  expect(event?.signups).toHaveLength(count);
  expect(event?.signups[0].dj_refs[0].path).toBe(`djs/${world.dj!.uid}`);
});

Then("I see the {string} notice", async ({ page }, text: string) => {
  await expect(page.getByRole("heading", { name: text })).toBeVisible();
});

Then("I cannot start a signup", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Get Started" })).toHaveCount(0);
});

// ---- Lineup and whiteboard ----------------------------------------------------------------

When("I close signups and add every signup to the lineup", async ({ page, world }) => {
  const event = await getEvent(world.eventId!);
  await closeSignupsAndBuildLineup(page, world.eventId!, event!.signups.length);
});

When("I update the whiteboard", async ({ page, world }) => {
  await updateBoard(page, world.eventId!);
});

Then("signups are closed and the event has {int} lineup slots", async ({ world }, count: number) => {
  const event = await getEvent(world.eventId!);
  expect(event?.signupsAreOpen).toBe(false);
  expect(event?.slots).toHaveLength(count);
});

Then("the whiteboard lists {string} and {string}", async ({}, first: string, second: string) => {
  const board = await readBoardFile("TimesGMT.txt");
  expect(board).toContain(first);
  expect(board).toContain(second);
});
