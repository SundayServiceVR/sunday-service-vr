import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat"

export default () => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(advancedFormat);
}