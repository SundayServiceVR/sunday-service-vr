import { DocumentReference } from "firebase/firestore";

export type Dj = {
    discord_id: string;
    public_name: string;
    dj_name: string;
    twitch_username?: string;
    rtmp_url?: string;
}

export type Slot = {
    dj_ref: DocumentReference;
    start_time?: Date;
    duration: SlotDuration;
    is_live?: boolean;

    stream_source_type?: StreamSourceType;

    prerecord_url?: string;

    //Depricated
    slot_type?: SlotType;
    is_debut?: boolean;
    discord_id?: string,
    dj_name?: string,
    rtmp_url: string;
    twitch_username: string;
}

export enum SlotType {
    LIVE = "LIVE",
    PRERECORD = "PRERECORD",

    //Depricated
    RTMP = "RTMP",
    TWITCH = "TWITCH",
}

export enum StreamSourceType {
    VRCDN = "VRCDN",
    TWITCH = "TWITCH",
    PRERECORD = "PRERECORD",
    RTMP = "RTMP",
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
    published: boolean,
    message: string;
    start_datetime: Date;
    end_datetime?: Date;
    host: string;
    slots: Slot[];
    footer: string;
    dj_signups: {
        dj_ref: DocumentReference;
        // hidden?: boolean;
    }[]
    dj_plays: DocumentReference[],
}