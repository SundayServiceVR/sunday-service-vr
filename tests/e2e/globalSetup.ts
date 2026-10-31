import { assertStackIsUp } from "../helpers/stack";
import { assertSeeded } from "../helpers/fixtures";
import { resetMockGithub } from "../helpers/mockGithub";

export default async function globalSetup() {
  await assertStackIsUp({ webapp: true });
  await assertSeeded();
  await resetMockGithub();
}
