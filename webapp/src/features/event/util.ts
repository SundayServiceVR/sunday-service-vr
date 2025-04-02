import { Event, EventSignup, Slot } from "../../util/types";

export const setEventSlotByIndex = (event : Event, slot_index: number, newSlot: Slot) => {
      const slots_copy = [...event.slots];
      slots_copy[slot_index] = newSlot;
      return {...event, slots: slots_copy} as Event
  }
  
export const updateSignupForEvent = (event: Event, signup: EventSignup) => {
    const newSignups = event.signups.map(dj_signup =>
        dj_signup.uuid === signup.uuid ? signup : dj_signup
    );

    return { ...event, signups: newSignups } as Event
}