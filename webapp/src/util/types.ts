
export type Dj = {
    id?: string;
    discord_username: string;
    dj_name?: string;
    twitch_url?: string;
    stream_url?: string;
}

export type Slot = {
    dj: Dj;
    startTime?: Date | undefined;
    duration: SlotDuration;
    isDebutt: boolean; 
}

export type SlotDuration = (0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4);

export type Event = {
    id?: string;
    name: string;
    message: string;
    start_datetime: Date;
    end_datetime?: Date;
    host: string;
    slots: Slot[];
    footer: string;
}
