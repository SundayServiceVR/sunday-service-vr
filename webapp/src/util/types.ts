import { DocumentReference } from "firebase/firestore";

export type Dj = {
    discord_id: string;
    public_name: string;
    dj_name: string;
    twitch_username?: string;
    rtmp_url?: string;
    events?: DocumentReference[];
    notes?: string[];
}

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
    signups: EventSignup[]
    dj_plays: DocumentReference[],
}

export type EventSignup = {
    uuid: string;
    name: string;
    dj_refs: DocumentReference[];
    is_debut: boolean;
    requested_duration: SlotDuration;
    type: SlotType;
}

export type Slot = {

    signup_uuid?: string;
    stream_source_type?: StreamSourceType;
    stream_source_url?: string;
    duration: SlotDuration;

    // Reconciled Fields
    start_time: Date;

    // Calculated for ease of access and record keeping
    name?: string;
    djs?: {
        dj_name?: string,
        discord_id?: string,
    }[];

    //Depricated
    is_live?: boolean;
    dj_ref: DocumentReference;
    prerecord_url?: string;
    slot_type?: SlotType;
    is_debut?: boolean;
    discord_id?: string,
    dj_name?: string,
    rtmp_url?: string;
    twitch_username?: string;

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
    MANUAL = "MANUAL",
    RTMP = "RTMP",
}

export const SlotTypes = 
    [
        { name: 'Active', value: '1' },
        { name: 'Radio', value: '2' },
        { name: 'Radio', value: '3' },
    ];


export type SlotDuration = (0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4);
