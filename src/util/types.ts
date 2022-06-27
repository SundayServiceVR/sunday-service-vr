
export type Dj = {
    name: string;
    twitch_url: string;
}

export type Slot = {
    dj: Dj;
    duration: (0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4),
}

export type Event = {
    name: string;
    start_datetime: Date;
    slots: Slot[];
}