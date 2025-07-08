import { Event, EventSignup, Slot } from "../../util/types";

/**
 * Checks if a slot's scheduled time is outside of the signup's availability window
 * @param slot - The slot to check
 * @param signup - The signup with availability information
 * @returns true if there's a conflict (slot time is outside availability), false otherwise
 */
export const hasAvailabilityConflict = (slot: Slot, signup: EventSignup): boolean => {
    // If no availability data, assume no conflict
    if (!signup.event_signup_form_data?.available_from || !signup.event_signup_form_data?.available_to) {
        return false;
    }

    const { available_from, available_to } = signup.event_signup_form_data;
    
    // If availability is "any", no conflict
    if (available_from === "any" || available_to === "any") {
        return false;
    }

    // If slot has no start time, we can't determine conflict
    if (!slot.start_time) {
        return false;
    }

    // Convert dates to time only for comparison (same day)
    const slotTime = slot.start_time.getTime();
    const availableFromTime = available_from.getTime();
    const availableToTime = available_to.getTime();

    // Check if slot time is outside the availability window
    return slotTime < availableFromTime || slotTime > availableToTime;
};

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