import { Event, Slot } from "../../../webapp/src/util/types";

type TimeFormat = {
    shortTimezone: string,
    locale: string,
    timezone: string,
}

export const timeFormats: {[key: string] : TimeFormat} = {
    GMT: {
        shortTimezone: "GMT",
        locale: "en-GB",
        timezone: "Europe/London",
    },
    AU: {
        shortTimezone: "AU",
        locale: "en-AU",
        timezone: "Australia/Sydney",
    },
    EST: {
        shortTimezone: "EST",
        locale: "en-US",
        timezone: "America/New_York",
    },
    CST: {
        shortTimezone: "CST",
        locale: "en-US",
        timezone: "America/Chicago",
    },
    MST: {
        shortTimezone: "MST",
        locale: "en-US",
        timezone: "America/Denver",
    },
    PST: {
        shortTimezone: "PST",
        locale: "en-US",
        timezone: "America/Los_Angeles",
    },
};

export const getLineupText = (event: Event, timeFormat: TimeFormat): string => {
    const eventStartDateFormatted = [
        event.start_datetime.getUTCFullYear(),
        event.start_datetime.getUTCMonth() + 1,
        event.start_datetime.getUTCDate(),
    ].join("-");

    return `${event.name}
${eventStartDateFormatted}
Host: ${event.host}

Lineup: (times ${timeFormat.shortTimezone})

${event.slots.map((slot) => getSlotText(event, slot, timeFormat)).join("\n")}
`;
};

const getSlotText = (event: Event, slot: Slot, timeFormat: TimeFormat): string => [
    slot?.start_time?.toLocaleTimeString(
        timeFormat.locale, { timeZone: timeFormat.timezone, timeStyle: "short" }
    )?? "",
    slot.reconciled.signup?.name ?? slot.dj_name,
    slot.reconciled.signup.is_debut ? " DEBUTT" : null,
].join(" ").trim();
