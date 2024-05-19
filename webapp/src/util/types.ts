import { DocumentReference } from "firebase/firestore";

export type Dj = {
    discord_username: string;
    name?: string;
    twitch_username?: string;
    rtmp_url?: string;
}

export type Slot = {
    dj_ref: DocumentReference;
    start_time?: Date | undefined;
    duration: SlotDuration;
    slot_type?: SlotType;

    dj_name: string,
    rtmp_url?: string;
    twitch_username?: string;
    prerecord_url?: string;

    is_debut: boolean;
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
