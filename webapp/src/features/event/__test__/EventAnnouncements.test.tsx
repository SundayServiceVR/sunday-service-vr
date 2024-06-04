import { render, screen } from "@testing-library/react";
import { RenderRouteWithOutletContext } from "../../../test/RenderRouteWithOutletContext";
import { testEvent } from "./EventTestingUtil";
import EventAnnouncements from "../EventAnnouncements";
import { expectedDiscord, expectedSocialMedia } from "./EventTestingUtil";

const mockContext = [testEvent, () => {}];

describe("EventAnnouncements", () => {
  it("creates correct Discord message", () => {
    render(
      <RenderRouteWithOutletContext context={mockContext}>
        <EventAnnouncements />
      </RenderRouteWithOutletContext>
    );

    const discordBox = screen.getByRole("textbox", {
      name: /Discord Announcement Text/,
    }) as HTMLInputElement;

    expect(discordBox).toBeInTheDocument();
    expect(discordBox.value).toBe(expectedDiscord);
  });

  it("creates correct social media message", () => {
    render(
      <RenderRouteWithOutletContext context={mockContext}>
        <EventAnnouncements />
      </RenderRouteWithOutletContext>
    );

    const socialMediaBox = screen.getByRole("textbox", {
      name: /Social Media Announcement Text/,
    }) as HTMLInputElement;

    expect(socialMediaBox).toBeInTheDocument();
    expect(socialMediaBox.value).toBe(expectedSocialMedia);
  });
});
