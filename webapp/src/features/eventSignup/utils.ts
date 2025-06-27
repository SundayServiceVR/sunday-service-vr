import { Timestamp } from "firebase/firestore";

export function getHourOptionFromAvailability(availability: Date | Timestamp | "any" | undefined) {
    if(availability === undefined || availability === "any" || (availability instanceof Timestamp && (Number.isNaN(availability.seconds) || Number.isNaN(availability.nanoseconds)))) {
      return "any";
    }

    if(availability instanceof Date) {
        return availability.toISOString(); // "HH:mm"
    }
  
    return new Timestamp(availability.seconds, availability.nanoseconds).toDate().toISOString(); // "YYYY-MM-DDTHH:mm"
  
  }

  export function getPrettyValueFromAvailability(availability: Date | Timestamp | "any" | undefined) {
    if(!availability) {
        return "Unknown";
      }
    if(availability === "any") {
      return "Any";
    }

    if(availability instanceof Date) {
        return availability.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    }


    return new Timestamp(availability.seconds, availability.nanoseconds).toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }