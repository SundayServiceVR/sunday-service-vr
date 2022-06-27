
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

export const RESIDENT_DJS: {[key: string]: Dj} = {
    "StrawberryProtato": {
        name: "StrawberryProtato",
        twitch_url: "https://www.twitch.com/StrawberryProtato",
    },
    "kittz": {
        name: "kittz",
        twitch_url: "https://www.twitch.com/kittz",
    },
    "whitty": {
        name: "whitty",
        twitch_url: "https://www.twitch.com/wittykat",
    },
    "bleatr": {
        name: "bleatr",
        twitch_url: "https://www.twitch.com/bleatrbeats",
    },
    "schlick": {
        name: "schlick",
        twitch_url: "https://www.twitch.com/schlick",
    }
}