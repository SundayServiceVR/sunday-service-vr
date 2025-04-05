import { EventSignup, Slot } from "../../util/types";
import { getSignupForSlot } from "../../contexts/useEventDjCache/helpers";
import { DjCache } from "../../contexts/useEventDjCache/types";
import { Event } from "../../util/types";

export const reconcileEventData = (event: Event, djCache: DjCache): Event => {
  let newEvent = calcSlotTimes(event);
  newEvent = setDjPlays(event);
  newEvent = calcSlotFromSignup(event, djCache);
  return newEvent
}

const calcSlotTimes = (event: Event): Event => {
  const newEvent = { ...event }; // Shallow Copy

  const ONE_HOUR = 60 * 60 * 1000;

  const time_counter = new Date(newEvent.start_datetime);
  for (let i = 0; i < event.slots.length; i++) {
    event.slots[i].start_time = new Date(time_counter);
    time_counter.setTime(time_counter.getTime() + ONE_HOUR * event.slots[i].duration);
  }

  newEvent.end_datetime = new Date(time_counter);

  return newEvent;
}

// Before saving, we want to set dj plays for tracking here.
const setDjPlays = (event: Event) => {

  const legacyDjPlays = event.slots.map((slot: Slot) => slot.dj_ref) ?? []

  const newDjPlays = event.slots.map((slot: Slot) => event.signups?.find(
    (signup: EventSignup) => signup.uuid === slot.signup_uuid))
    .filter((signup): signup is EventSignup => signup !== undefined)
    .map((signup: EventSignup) => signup.dj_refs).flat()
    ?? [];

  return {
    ...event,
    dj_plays: [...legacyDjPlays, ...newDjPlays]
  } as Event
}

const calcSlotFromSignup = (event: Event, djCache: DjCache): Event => {
  const newEvent = { ...event }; // Shallow Copy

  newEvent.slots = event.slots.map((slot: Slot) => {
    const signup = getSignupForSlot(event, slot) as EventSignup;
    return {
      ...slot,
      name: signup?.name ?? slot.dj_name,
      djs: signup?.dj_refs.map(
        (ref) => ({
          name: djCache.get(ref.id)?.dj_name ?? `DJ: ${ref.id}`,
          discord_id: djCache.get(ref.id)?.discord_id ?? undefined,
        })
      )
    }

  });

  return newEvent;
}