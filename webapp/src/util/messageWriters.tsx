import dayjs from "dayjs";
import { Event, Slot } from "./types";
import { attendeeRoleId, performerRoleId, signupSheetUrl } from "./constants";

export const getDiscordMessage = (event: Event): string => 
`**${event.name}**

${event.message}

Event start: ${dateToDiscordTime(event.start_datetime).replace(">",":F>")}

Host: ${event.host || "TBA"}

DJs:
${event.slots.map(s => getDiscordSlotText(s)).join("\n")}

https://discord.s4vr.net/
https://twitch.s4vr.net/

<@&${attendeeRoleId}>`;


export const getTwitterMessage = (event: Event): string => {
    const ukDayTz = dayjs.tz(event.start_datetime, "GB");
return `${event.name}
${ukDayTz.format("YYYY-MM-DD")}
Host: ${event.host || "TBA"}

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
Host: ${event.host || "TBA"}

Lineup: (times ${ukDayTz.format('z')
                        .replace("GMT+1","BST")})
${event.slots.map(getUkSlotText).join("\n")}
`;
}


export const getAusPasteMessage = (event: Event): string => {
    const ausDayTz = dayjs.tz(event.start_datetime, "Australia/Sydney");
    return `${event.name}
${ausDayTz.format("YYYY-MM-DD")}
Host: ${event.host || "TBA"}

Lineup: (times ${ausDayTz.format('z')
                        .replace("GMT+11","AEDT")
                        .replace("GMT+10","AEST")})
${event.slots.map(getAusSlotText).join("\n")}
`;
}


export const getProposedLineupMessage = (event: Event): string => 
`**Proposed Lineup for ${dateToDiscordTime(event.start_datetime).replace(">",":F>")}**

${event.slots.map(s => getDiscordSlotText(s, true)).join("\n")}

Host: ${event.host || "TBA"}

If you are listed above, please react to this message if your slot works for you!`;


export const getSignupsPostedMessage = (event: Event): string => {
return `Signups are open for ${dateToDiscordTime(event.start_datetime).replace(">",":F>")}! Here's the signup sheet:

${signupSheetUrl}

${event.host ? `Your host this week is ${event.host}!` : "Host TBD!"}

<@&${performerRoleId}>`
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


const getDiscordSlotText = (slot: Slot, pingDj: boolean = false): string => {
    const debuttText = `${slot.is_debut? " (DEBUTT!)" : ""}`
    if (pingDj) {
        return `${slot.start_time ? dateToDiscordTime(slot.start_time) : ""} : <@${slot.discord_id}> [${slot.dj_name}]${debuttText}`;
    } else {
        return `${slot.start_time ? dateToDiscordTime(slot.start_time) : ""} : ${slot.dj_name}${debuttText}`;
    }
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
