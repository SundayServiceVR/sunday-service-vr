import { Dj, Event } from "./types"

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

export const default_event: Event = {
    name: "bleatr's test extraviganza",
    start_datetime: new Date(),
    slots: [{
        dj: RESIDENT_DJS.kittz,
        duration: 1,
    },{
        dj: RESIDENT_DJS.bleatr,
        duration: 1,
    },{
        dj: RESIDENT_DJS.whitty,
        duration: 1,
    },{
        dj: RESIDENT_DJS.StrawberryProtato,
        duration: 1,
    }]
  }