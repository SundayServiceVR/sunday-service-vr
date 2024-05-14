
export type Dj = {
    id?: string;
    discord_username: string;
    name?: string;
    twitch_url?: string;
    stream_url?: string;
}

export type Slot = {
    dj: Dj;
    startTime?: Date | undefined;
    duration: SlotDuration;
    slotType: SlotType;
    mediaSourceUrl?: string;
    twitchUserName?: string;
    isDebutt: boolean;
}

export enum SlotType {
    RTMP = "RTMP",
    TWITCH = "TWITCH",
    PRERECORD = "PRERECORD",
}

export const SlotTypes = 
    [
        { name: 'Active', value: '1' },
        { name: 'Radio', value: '2' },
        { name: 'Radio', value: '3' },
      ];


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
