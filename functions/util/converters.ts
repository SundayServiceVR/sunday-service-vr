import { DocumentData } from "firebase-admin/firestore";
import { Event, Slot } from "../../webapp/src/util/types";

export const docToEvent = (data: DocumentData) => {
    if (data) {
      const event = {
        ...data,
        id: "don't-need",
        start_datetime: data.start_datetime.toDate(),
        end_datetime: data.end_datetime?.toDate(),
        slots: data.slots.map((slot: any) => ({ ...slot, start_time: slot.start_time.toDate() }) as Slot)
      } as Event;
  
      return event;
    }
    return null;
  }
