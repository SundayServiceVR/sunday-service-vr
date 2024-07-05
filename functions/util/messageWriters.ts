import { Event, Slot } from "../../webapp/src/util/types";

//"GB",
//"Australia/Sydney",
export const getLineupText = (event: Event): string => {
    // const ukDayTz = dayjs.tz(event.start_datetime, timezone);
    const eventStartDateFormatted = event.start_datetime.toLocaleDateString('en-GB', { timeZone: 'Europe/London' });
    
    return `${event.name}
${eventStartDateFormatted}
Host: ${event.host}

Lineup: (times BST}))
            
${event.slots.map(getUkSlotText).join("\n")}
`;
}

const getUkSlotText = (slot: Slot): string => [
        slot?.start_time?.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', timeStyle: "short"}) ?? "",
        slot.dj_name,
        slot.is_debut ? " DEBUTT" : null
    ].join(" ").trim();

// const getAusSlotText = (slot: Slot): string => {
//     const debuttText = `${slot.is_debut ? " DEBUTT" : ""}`
//     const slotText = `${slot.start_time ? dateToLineupTime(slot.start_time, "Australia/Sydney") : ""} ${slot.dj_name}${debuttText}`;
//     return slotText;
// }

