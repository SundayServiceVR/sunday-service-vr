import { EventSignup, Slot, SlotType } from "../../util/types";
import { DjCache } from "../../contexts/useEventDjCache/types";
import { Event } from "../../util/types";

export const reconcileEventData = (event: Event, djCache: DjCache): Event => {
  let newEvent = calcSlotTimes(event);
  newEvent = setDjPlays(newEvent);
  newEvent = calcSlotsFromSignups(newEvent, djCache);
  return newEvent
}

const calcSlotTimes = (event: Event): Event => {
  const newEvent = { ...event }; // Shallow Copy

  const ONE_HOUR = 60 * 60 * 1000;

  const time_counter = new Date(newEvent.start_datetime);
  for (let i = 0; i < event.slots?.length; i++) {
    event.slots[i].start_time = new Date(time_counter);

    time_counter.setTime(time_counter.getTime() + ONE_HOUR * (event.slots[i].reconciled.signup.requested_duration));
  }

  newEvent.end_datetime = new Date(time_counter);

  return newEvent;
}

// Before saving, we want to set dj plays for tracking here.
const setDjPlays = (event: Event) => {
  if (!event.slots) {
    return {
      ...event,
      dj_plays: []
    } as Event
  }

  const legacyDjPlays = event.slots.map((slot: Slot) => slot.dj_ref) ?? [];

  const newDjPlays = event.slots.map(slot => slot.reconciled.signup.dj_refs).flat();

  const dj_plays = newDjPlays.length > 0 ? newDjPlays : legacyDjPlays;

  return {
    ...event,
    dj_plays,
  } as Event
}

const calcSlotsFromSignups = (event: Event, djCache: DjCache): Event => {
  const newEvent = { ...event }; // Shallow Copy

  if (!event.slots) {
    return { ...event } as Event;
  }

  newEvent.slots = event.slots.map((slot: Slot) => {
    const signup = event.signups.find(signup => signup.uuid === slot.signup_uuid) ?? {
        // Legacy support
        uuid: "",
        name: slot.dj_name ?? "Unknown Name",
        dj_refs: [],
        is_debut: slot.is_debut ?? false,
        requested_duration: 1,
        type: slot.slot_type ?? SlotType.LIVE,
    };

    const getDjInfoFromSignups = (signup: EventSignup) => signup?.dj_refs?.map(
      (ref) => {

        const result:{
          dj_name?: string,
          discord_id?: string,
        } = {
          dj_name: djCache.get(ref.id)?.dj_name ?? `DJ: ${ref.id}`
        };
        const discord_id = djCache.get(ref.id)?.discord_id ?? undefined;

        if (discord_id) {
          result.discord_id = discord_id;
        }

        return result
      }
    );

    const getDjInfoFromLegacySlot = () => {
      const result: {
        dj_name?: string,
        discord_id?: string,
      } = {};
      
      if(slot.dj_name) {
        result.dj_name = slot.dj_name;
      }
      const discordId = djCache.get(slot.dj_ref.id)?.discord_id ?? undefined;

      if(discordId) {
        result.discord_id = discordId;
      }
      return [result];
    }

    const djs = signup ? getDjInfoFromSignups(signup) : getDjInfoFromLegacySlot();

    return {
      ...slot,
      name: signup?.name ?? slot.dj_name,
      reconciled: {
        signup,
      },
      djs: djs ?? [],
    }

  });

  return newEvent;
}