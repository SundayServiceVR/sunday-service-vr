import { render, screen } from "@testing-library/react";
import { RenderRouteWithOutletContext } from "../../../test/RenderRouteWithOutletContext";
import { testEvent } from "./EventTestingUtil";
import EventAnnouncements from "../EventAnnouncements";

const mockContext = [testEvent, () => {}];

const expectedDiscord = `**The Most Real Event**

Yo we got Skrillex to play!!! Come to this super real event!!!

Event start: <t:1712516400:F>

Host: Strawbs

DJs:
<t:1712516400> : Kittz
<t:1712520000> : Icedog
<t:1712521800> : Intermission
<t:1712523600> : Skrillex (DEBUTT!)

https://discord.s4vr.net/
https://twitch.s4vr.net/
`;

const expectedSocialMedia = `The Most Real Event
2024-04-07
Host: Strawbs

Lineup: (times BST)
8p - Kittz
9p - Icedog
9:30p - Intermission
10p - Skrillex - DEBUTT

https://twitch.s4vr.net/
`;

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
