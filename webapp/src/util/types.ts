
export type Dj = {
    name: string;
    twitch_url?: string;
    vrcdn_url?: string;
}

export type Slot = {
    dj: Dj;
    startTime?: Date | undefined;
    duration: SlotDuration;
    isDebutt: boolean; 
}

export type SlotDuration = (0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4);

export type Event = {
    name: string;
    message: string;
    start_datetime: Date;
    host: string;
    slots: Slot[];
    footer: string;
}

