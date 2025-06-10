import { Timestamp } from "firebase/firestore";

export function getHourOptionFromAvailability(availability: Date | Timestamp | "any" | undefined) {
    if(availability === undefined || availability === "any") {
      return "any";
    }

    if(availability instanceof Date) {
        return availability.toISOString(); // "HH:mm"
    }
  
    return availability.toDate().toISOString(); // "YYYY-MM-DDTHH:mm"
  
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

    return availability.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }