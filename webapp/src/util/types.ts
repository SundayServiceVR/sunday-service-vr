import { APIGuildMember } from "discord-api-types/v10";
import { DocumentReference } from "firebase/firestore";

export type Dj = {

    roles?: AppUserRole[];

    discord_id: string;
    discord?: APIGuildMember;

    public_name: string;
    public_avatar?: string;
    
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
    name: string;
    // submitter_discord_id: string;
    requested_duration: SlotDuration;
    type: SlotType;
    // submitter_notes: string;

    uuid: string;
    dj_refs: DocumentReference[];
    is_debut: boolean;
    // maintainer_notes: string;

}

export type Slot = {

    signup_uuid?: string;
    stream_source_type?: StreamSourceType;
    stream_source_url?: string;

    // Reconciled Fields for ease of access and record keeping
    start_time: Date;

    // TODO:  I'd like to move all of these to the reconciled field for
    // the sake of clarity and self-documentation.
    reconciled: {
        signup: EventSignup,
    }

    djs?: {
        dj_name?: string,
        discord_id?: string,
    }[];

    //Depricated
    duration: SlotDuration;
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

export type AppUserRole = {
    role: 'admin' | 'host' | 'dj';
    club_id?: string;
}