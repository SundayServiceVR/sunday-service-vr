
export type Dj = {
    name: string;
    twitch_url: string;
}

export type Slot = {
    dj: Dj;
    startTime?: Date | undefined;
    duration: (0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4),
}

export type Event = {
    name: string;
    message: string;
    start_datetime: Date;
    slots: Slot[];
}

export const getDiscordMessage = (event: Event): string => {
    return `${event.name}
${event.message}
${dateToDiscordTime(event.start_datetime)}

DJs:
${event.slots.map((slot: Slot) => `${slot.startTime ? dateToDiscordTime(slot.startTime) : ""}: ${slot.dj.name}`).join("\n")}`;
}

export const calcSlotTimes = (event: Event): Event => {
    const newEvent =  {...event}; // Shallow Copy

    const ONE_HOUR = 60*60*1000;

    const time_counter = new Date(newEvent.start_datetime);
    for(let i = 0; i < event.slots.length; i++){
        event.slots[i].startTime = new Date(time_counter);
        time_counter.setTime(time_counter.getTime() + ONE_HOUR * event.slots[i].duration);
    }

    return newEvent;
}

const dateToDiscordTime = (date: Date): string => {
    // Example: <t:1656270000:R>
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}