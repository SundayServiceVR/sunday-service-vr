import { render, screen } from "@testing-library/react";
import { RenderRouteWithOutletContext } from "../../../test/RenderRouteWithOutletContext";
import { testEvent } from "./EventTestingUtil";
import WhiteboardWriter from "../EventWhiteboard";

const mockContext = [testEvent, () => {}];

const expectedUk = `The Most Real Event
2024-04-07
Host: Strawbs

Lineup: (times BST)
8p Kittz
9p Icedog
9:30p Intermission
10p Skrillex DEBUTT
`;

const expectedAu = `The Most Real Event
2024-04-08
Host: Strawbs

Lineup: (times AEST)
5a Kittz
6a Icedog
6:30a Intermission
7a Skrillex DEBUTT
`;

describe("EventWhiteboard", () => {
  it("creates correct UK whiteboard", () => {
    render(
      <RenderRouteWithOutletContext context={mockContext}>
        <WhiteboardWriter />
      </RenderRouteWithOutletContext>
    );

    const ukBox = screen.getByRole("textbox", {
      name: /UK whiteboard textbox/,
    }) as HTMLInputElement;

    expect(ukBox).toBeInTheDocument();
    expect(ukBox.value).toBe(expectedUk);
  });

  it("creates correct AU whiteboard", () => {
    render(
      <RenderRouteWithOutletContext context={mockContext}>
        <WhiteboardWriter />
      </RenderRouteWithOutletContext>
    );

    const auBox = screen.getByRole("textbox", {
      name: /AU whiteboard textbox/,
    }) as HTMLInputElement;

    expect(auBox).toBeInTheDocument();
    expect(auBox.value).toBe(expectedAu);
  });
});
