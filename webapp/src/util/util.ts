import dayjs from "dayjs";
import setupDayjs from "./setupDayjs";

setupDayjs();

// God forgive these sins
// i forgive u bc i did worse -frosty
export const nextSundayServiceDefaultDateTime = (): Date => {
    const today = new Date();
    const targetDay = new Date();

    const day_offset = 0; //Set the day of the week here
    targetDay.setUTCDate(today.getUTCDate() + (day_offset + 7 - today.getUTCDay()) % 7);

    targetDay.setUTCHours(19);
    targetDay.setUTCMinutes(0);
    targetDay.setUTCSeconds(0);
    targetDay.setUTCMilliseconds(0);
    targetDay.getTimezoneOffset();

    const dateString = `${targetDay.toISOString().slice(0, 10)} 20:00`;
    const targetDate = dayjs.tz(dateString, "Europe/London").toDate();

    return targetDate;

}

// Current link: Q3 signup sheet
export const signupSheetUrl = "https://docs.google.com/spreadsheets/d/1fExUQrOqo8lP2AS35Atlk8E5TiTH6y4qVMPxlN1diTA/edit?usp=sharing";