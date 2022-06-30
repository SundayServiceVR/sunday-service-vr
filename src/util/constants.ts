import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Dj, Event } from "./types"

dayjs.extend(utc);
dayjs.extend(timezone);

export const RESIDENT_DJS: { [key: string]: Dj } = {
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

// God forgive these sins
const nextSundayServiceDefaultDateTime = (): Date => {
    let today = new Date();
    let targetDay = new Date();

    const day_offset = 0; //Set the day of the week here
    targetDay.setUTCDate(today.getUTCDate() + (day_offset + 7 - today.getUTCDay()) % 7);

    targetDay.setUTCHours(19);
    targetDay.setUTCMinutes(0);
    targetDay.setUTCSeconds(0);
    targetDay.setUTCMilliseconds(0);
    targetDay.getTimezoneOffset();

    const dateString = `${targetDay.toISOString().slice(0, 10)} 20:00`;
    console.log(dateString);
    const targetDate = dayjs.tz(dateString, "Europe/London").toDate();

    return targetDate;

}

export const default_event: Event = {
    name: "Sunday Service",
    start_datetime: nextSundayServiceDefaultDateTime(),
    message: "Come by to chill and wiggle to some Sunday Service tunes!",
    slots: [{
        dj: RESIDENT_DJS.kittz,
        duration: 1,
    }, {
        dj: RESIDENT_DJS.bleatr,
        duration: 1,
    }, {
        dj: RESIDENT_DJS.whitty,
        duration: 1,
    }, {
        dj: RESIDENT_DJS.StrawberryProtato,
        duration: 1,
    }]
}