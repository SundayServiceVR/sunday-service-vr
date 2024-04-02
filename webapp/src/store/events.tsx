import { nextSundayServiceDefaultDateTime } from '../util/util';
import { Event } from '../util/types';
 
export const saveEvent = (event: Event) => {
    localStorage.setItem("event", JSON.stringify(event));
}

export const loadEvent = () => {
    const jsonBlob = localStorage.getItem("event");
    if(jsonBlob === null) {
        return null;
    }
    const value = JSON.parse(jsonBlob);
    value.start_datetime = new Date(value.start_datetime);
    return value as Event;
}

export const default_event: Event = {
    name: "Sunday Service",
    start_datetime: nextSundayServiceDefaultDateTime(),
    message: "Come by to chill and wiggle to some Sunday Service tunes!",
    slots: [],
}

export enum EventActionType {
    SetEvent = "SETEVENT",
    Reset = "RESET",
}

export type EventAction = {
    type: EventActionType,
    payload?: Event
}

 // https://devtrium.com/posts/how-to-use-react-usereducer-hook
 export function eventStateReducer(state: Event, action: EventAction): Event {
    switch (action.type) {
      case EventActionType.SetEvent:
        if (action.payload !== undefined) {
          const event = { ...action.payload };
          calcSlotTimes(event);
          saveEvent(event);
          return event;
        } else {
          throw new Error("Expected an payload to be populated, but it was undefined");
        }

      case EventActionType.Reset:
        saveEvent(default_event);
        return default_event;
      default:
        throw new Error();
    }
  }

  const calcSlotTimes = (event: Event): Event => {
    const newEvent =  {...event}; // Shallow Copy

    const ONE_HOUR = 60*60*1000;

    const time_counter = new Date(newEvent.start_datetime);
    for(let i = 0; i < event.slots.length; i++){
        event.slots[i].startTime = new Date(time_counter);
        time_counter.setTime(time_counter.getTime() + ONE_HOUR * event.slots[i].duration);
    }

    return newEvent;
}