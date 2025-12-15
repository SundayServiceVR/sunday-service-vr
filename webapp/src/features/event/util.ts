import { Event, EventSignup, Slot } from "../../util/types";

/**
 * Checks if a slot's scheduled time is outside of the signup's availability window
 * @param slot - The slot to check
 * @param signup - The signup with availability information
 * @returns true if there's a conflict (slot time is outside availability), false otherwise
 */
export const hasAvailabilityConflict = (slot: Slot, signup: EventSignup): boolean => {
  const formData = signup.event_signup_form_data;

  // If no availability data, assume no conflict
  if (!formData?.available_from || !formData?.available_to) {
    return false;
  }

  const { available_from, available_to } = formData;


  // If slot has no start time, we can't determine conflict
  if (!slot.start_time) {
    return false;
  }

  const slotStart = slot.start_time.getTime();

  // If you have a duration on the slot, use it; otherwise fall back to
  // treating it as an instant (same as current behavior).
  const durationHours = slot.duration ?? formData.requested_duration ?? 0;
  const slotEnd = new Date(slot.start_time.getTime() + durationHours * 60 * 60 * 1000).getTime();

  // Compute bounds, allowing each side to be "any" or missing. If a bound is
  // not a Date (including "any"), treat that side as unconstrained.
  const availableFrom = available_from instanceof Date ? available_from.getTime() : undefined;
  const availableTo = available_to instanceof Date ? available_to.getTime() : undefined;

  // Treat availability as inclusive: the full slot [start,end] must fit within
  // any concrete bounds we have.
  const startsBeforeAvailable =
    typeof availableFrom === 'number' ? slotStart < availableFrom : false;
  const endsAfterAvailable =
    typeof availableTo === 'number' ? slotEnd > availableTo : false;

  return startsBeforeAvailable || endsAfterAvailable;
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