import { Event, Slot } from "../../webapp/src/util/types";

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
            
${event.slots.map((slot) => getSlotText(slot, timeFormat)).join("\n")}
`;
};

const getSlotText = (slot: Slot, timeFormat: TimeFormat): string => [
    slot?.start_time?.toLocaleTimeString(timeFormat.locale, { timeZone: timeFormat.timezone, timeStyle: "short" }) ?? "",
    slot.dj_name,
    slot.is_debut ? " DEBUTT" : null,
].join(" ").trim();
