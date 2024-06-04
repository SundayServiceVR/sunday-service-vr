import { render, screen } from "@testing-library/react";
import { RenderRouteWithOutletContext } from "../../../test/RenderRouteWithOutletContext";
import { testEvent } from "./EventTestingUtil";
import WhiteboardWriter from "../EventWhiteboard";
import { expectedUk, expectedAu } from "./EventTestingUtil";

const mockContext = [testEvent, () => {}];

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
