import { Slot, Event } from "../../util/types";

 export  const getSignupForSlot = (event: Event, slot: Slot) => {
    const result =  event.signups?.find(signups => signups.uuid === slot.signup_uuid);
    return result;
  }
