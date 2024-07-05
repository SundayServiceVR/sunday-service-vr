import { Event, Slot } from "../../webapp/src/util/types";

type TimeFormat = {
    locale: string,
    timezone: string,
}

export const timeFormats: {[key: string] : TimeFormat} = {
    GMT: {
        locale: "en-GB",
        timezone: "Europe/London",
    },
    AU: {
        locale: "en-AU",
        timezone: "Australia/Sydney",
    },
};

// "GB",
// "Australia/Sydney",
export const getLineupText = (event: Event, timeFormat: TimeFormat): string => {
    // const ukDayTz = dayjs.tz(event.start_datetime, timezone);
    const eventStartDateFormatted = [
        event.start_datetime.getUTCFullYear(),
        event.start_datetime.getUTCMonth() + 1,
        event.start_datetime.getUTCDate(),
    ].join("-");

    return `${event.name}
${eventStartDateFormatted}
Host: ${event.host}

Lineup: (times BST)
            
${event.slots.map((slot) => getSlotText(slot, timeFormat)).join("\n")}
`;
};

const getSlotText = (slot: Slot, timeFormat: TimeFormat): string => [
    slot?.start_time?.toLocaleTimeString(timeFormat.locale, { timeZone: timeFormat.timezone, timeStyle: "short" }) ?? "",
    slot.dj_name,
    slot.is_debut ? " DEBUTT" : null,
].join(" ").trim();

// const getAusSlotText = (slot: Slot): string => {
//     const debuttText = `${slot.is_debut ? " DEBUTT" : ""}`
//     const slotText = `${slot.start_time ? dateToLineupTime(slot.start_time, "Australia/Sydney") : ""} ${slot.dj_name}${debuttText}`;
//     return slotText;
// }

