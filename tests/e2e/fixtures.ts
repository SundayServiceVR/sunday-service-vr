import { test as base, createBdd } from "playwright-bdd";
import { deleteDj, deleteEvent, deleteEventsByName, deleteHostsByName, TestUser } from "../helpers/fixtures";
import { resetMockGithub } from "../helpers/mockGithub";

/** State shared between the steps of one scenario, plus cleanup of everything the scenario created. */
export class World {
  eventId?: string;
  eventName?: string;
  hostName?: string;
  /** The DJ the browser is signed in as. */
  dj?: TestUser;
  /** DJs created for the scenario, by DJ name. */
  djs: TestUser[] = [];
  private cleanups: (() => Promise<void>)[] = [];

  onCleanup(fn: () => Promise<void>) {
    this.cleanups.push(fn);
  }
  trackEvent(id: string) {
    this.eventId = id;
    this.onCleanup(() => deleteEvent(id));
  }
  trackEventName(name: string) {
    this.eventName = name;
    this.onCleanup(() => deleteEventsByName(name));
  }
  trackHostName(name: string) {
    this.hostName = name;
    this.onCleanup(() => deleteHostsByName(name));
  }
  trackDj(dj: TestUser) {
    this.djs.push(dj);
    this.onCleanup(() => deleteDj(dj));
  }
  async cleanup() {
    await Promise.all(this.cleanups.splice(0).map((fn) => fn()));
  }
}

export const test = base.extend<{ world: World }>({
  world: async ({}, use) => {
    await resetMockGithub();
    const world = new World();
    await use(world);
    await world.cleanup();
  },
});

export const { Given, When, Then } = createBdd(test);
