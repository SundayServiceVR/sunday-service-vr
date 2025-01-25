import { Event, Slot } from "../../util/types";

export const setEventSlotByIndex = (event : Event, slot_index: number, newSlot: Slot) => {
      const slots_copy = [...event.slots];
      slots_copy[slot_index] = newSlot;
      return {...event, slots: slots_copy} as Event
  }
  