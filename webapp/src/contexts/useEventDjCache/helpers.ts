import { Slot, Event } from "../../util/types";

 export  const getSignupForSlot = (event: Event, slot: Slot) => {
    const result =  event.signups?.find(signups => signups.uuid === slot.signup_uuid);

    if(!result) {
      throw new Error(`Unable to find signup for slot:  UUID ${slot.signup_uuid}`)
    }

    return result;
  }
