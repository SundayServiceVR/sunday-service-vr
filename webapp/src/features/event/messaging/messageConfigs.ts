import { Event } from "../../../util/types";
import { getDiscordMessage, getProposedLineupMessage, getSignupsPostedMessage, getTwitterMessage } from "../../../util/messageWriters";

export type MessageSendConfig = {
    /** Decides the button icon. */
    destination: "discord" | "other";
    buttonLabel: string;
    title: string;
    label: string;
    helpText: string;
    /** Where the user pastes the message; opened in a new window on "Save and Send". */
    url: string;
    /** The editable text for the event (stored override or generated default). */
    getMessage: (event: Event) => string;
    /** Returns the event with the edited text stored on it. */
    applyMessage: (event: Event, message: string) => Event;
    /** Final text to copy when it differs from the edited text. Also enables the preview tab. */
    getOutput?: (event: Event) => string;
};

const SCHEDULING_CHANNEL = "https://discord.com/channels/1004489038159413248/1204320477732929566";
const ANNOUNCEMENT_CHANNEL = "https://discord.com/channels/1004489038159413248/1004489042890588165";
const VRCHAT_POSTS = "https://vrchat.com/home/group/grp_626cd923-6dea-4583-abcb-8c09a765969f/posts";

export const lineupOpeningConfig = (signupUrl: string): MessageSendConfig => ({
    destination: "discord",
    buttonLabel: "Lineup Opening Message",
    title: "Lineup Opening Message",
    label: "Message",
    helpText: "Posted to #scheduling in Discord when signups open.",
    url: SCHEDULING_CHANNEL,
    getMessage: (e) => e.lineupOpeningMessage ?? getSignupsPostedMessage(e, signupUrl),
    applyMessage: (e, message) => ({ ...e, lineupOpeningMessage: message }),
});

export const lineupVerificationConfig: MessageSendConfig = {
    destination: "discord",
    buttonLabel: "Verify Lineup",
    title: "Verify Lineup",
    label: "Message",
    helpText: "Posted to #scheduling in Discord. React to your message so DJs can confirm.",
    url: SCHEDULING_CHANNEL,
    getMessage: (e) => e.lineupVerificationMessage ?? getProposedLineupMessage(e),
    applyMessage: (e, message) => ({ ...e, lineupVerificationMessage: message }),
};

export const discordAnnouncementConfig: MessageSendConfig = {
    destination: "discord",
    buttonLabel: "Discord Announcement",
    title: "Discord Announcement",
    label: "Discord Announcement Message",
    helpText: "This message will be included in your Discord announcement.",
    url: ANNOUNCEMENT_CHANNEL,
    getMessage: (e) => e.message,
    applyMessage: (e, message) => ({ ...e, message }),
    getOutput: (e) => getDiscordMessage(e),
};

export const vrchatMessageConfig: MessageSendConfig = {
    destination: "other",
    buttonLabel: "VRChat Message",
    title: "VRChat Message",
    label: "Social Media & VRChat Message",
    helpText: "Customize your message for VRChat and social media platforms. The default message is generated from your event details.",
    url: VRCHAT_POSTS,
    getMessage: (e) => e.socialMediaMessage || getTwitterMessage(e),
    applyMessage: (e, message) => ({ ...e, socialMediaMessage: message }),
};
