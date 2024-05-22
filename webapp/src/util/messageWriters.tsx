import dayjs from "dayjs";
import { Event, Slot } from "./types";

export const getDiscordMessage = (event: Event): string => 
`**${event.name}**

${event.message}

Event start: ${dateToDiscordTime(event.start_datetime).replace(">",":F>")}

Host: ${event.host}

DJs:
${event.slots.map(getDiscordSlotText).join("\n")}

https://discord.s4vr.net/
https://twitch.s4vr.net/
`;


export const getTwitterMessage = (event: Event): string => {
    const ukDayTz = dayjs.tz(event.start_datetime, "GB");
return `${event.name}
${ukDayTz.format("YYYY-MM-DD")}
Host: ${event.host}

Lineup: (times ${ukDayTz.format('z')
                        .replace("GMT+1","BST")})
${event.slots.map(getTwitterSlotText).join("\n")}

https://twitch.s4vr.net/
`;
}


export const getUkPasteMessage = (event: Event): string => {
    const ukDayTz = dayjs.tz(event.start_datetime, "GB");
return `${event.name}
${ukDayTz.format("YYYY-MM-DD")}
Host: ${event.host}

Lineup: (times ${ukDayTz.format('z')
                        .replace("GMT+1","BST")})
${event.slots.map(getUkSlotText).join("\n")}
`;
}

export const getAusPasteMessage = (event: Event): string =>{
    const ausDayTz = dayjs.tz(event.start_datetime, "Australia/Sydney");
    return `${event.name}
${ausDayTz.format("YYYY-MM-DD")}
Host: ${event.host}

Lineup: (times ${ausDayTz.format('z')
                        .replace("GMT+11","AEDT")
                        .replace("GMT+10","AEST")})
${event.slots.map(getAusSlotText).join("\n")}
`;
}


const dateToDiscordTime = (date: Date): string => {
    // Example: <t:1656270000:R>
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}


const dateToLineupTime = (date: Date, timezone : string): string => {
    return `${dayjs.tz(date, timezone).format('h:mma')
                                      .slice(0,-1)
                                      .replace(":00", "")}`;
}


const getDiscordSlotText = (slot: Slot): string => {
    const debuttText = `${slot.is_debut? " (DEBUTT!)" : ""}`
    const slotText = `${slot.start_time ? dateToDiscordTime(slot.start_time) : ""} : ${slot.dj_name}${debuttText}`;
    return slotText;
}


const getTwitterSlotText = (slot : Slot): string => {
    const debuttText = `${slot.is_debut? " - DEBUTT" : ""}`
    const slotText = `${slot.start_time ? dateToLineupTime(slot.start_time, "Europe/London") : ""} - ${slot.dj_name}${debuttText}`;
    return slotText;
}


const getUkSlotText = (slot : Slot): string => {
    const debuttText = `${slot.is_debut? " DEBUTT" : ""}`
    const slotText = `${slot.start_time ? dateToLineupTime(slot.start_time, "Europe/London") : ""} ${slot.dj_name}${debuttText}`;
    return slotText;
}


const getAusSlotText = (slot : Slot): string => {
    const debuttText = `${slot.is_debut? " DEBUTT" : ""}`
    const slotText = `${slot.start_time ? dateToLineupTime(slot.start_time, "Australia/Sydney") : ""} ${slot.dj_name}${debuttText}`;
    return slotText;
}
