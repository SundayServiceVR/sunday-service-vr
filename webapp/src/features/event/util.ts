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

  // If availability is "any", no conflict
  if (available_from === "any" || available_to === "any") {
    return false;
  }

  // If slot has no start time, we can't determine conflict
  if (!slot.start_time) {
    return false;
  }

  // Defensive: ensure we actually have Dates (in case data is deserialized oddly)
  if (!(available_from instanceof Date) || !(available_to instanceof Date)) {
    return false;
  }

  const slotStart = slot.start_time.getTime();

  // If you have a duration on the slot, use it; otherwise fall back to
  // treating it as an instant (same as current behavior).
  const durationHours = slot.duration ?? formData.requested_duration ?? 0;
  const slotEnd = new Date(slot.start_time.getTime() + durationHours * 60 * 60 * 1000).getTime();

  const availableFrom = available_from.getTime();
  const availableTo = available_to.getTime();

  // Treat the availability as inclusive:
  // OK if [slotStart, slotEnd] is within [availableFrom, availableTo].
  // Conflict otherwise.
  const startsBeforeAvailable = slotStart < availableFrom;
  const endsAfterAvailable = slotEnd > availableTo;

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