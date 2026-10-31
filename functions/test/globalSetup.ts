import { assertStackIsUp } from "../../tests/helpers/stack";

export default async function setup() {
  await assertStackIsUp({ webapp: false });
}
