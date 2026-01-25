import { EventSignup, Slot, SlotType } from "../../util/types";
import { DjCache } from "../../contexts/useEventDjCache/types";
import { Event } from "../../util/types";
import { HostCache } from "../../contexts/useEventDjCache/types";

/**
 * Reconciles event data by calculating slots from signups, setting DJ plays, calculating slot times, and resolving host information.
 * @param event - The event to reconcile.
 * @param djCache - A cache of DJ data.
 * @param hostCache - A cache of Host data.
 * @returns The reconciled event.
 */
export const reconcileEventData = (event: Event, djCache: DjCache, hostCache?: HostCache): Event => {
  let newEvent = calcSlotsFromSignups(event, djCache);
  newEvent = setDjPlays(newEvent);
  newEvent = calcSlotTimes(newEvent);
  newEvent = reconcileHost(newEvent, hostCache);
  return newEvent;
};

/**
 * Calculates slots from signups and enriches slot data with DJ information.
 * @param event - The event containing slots and signups.
 * @param djCache - A cache of DJ data.
 * @returns The event with updated slot data.
 */
const calcSlotsFromSignups = (event: Event, djCache: DjCache): Event => {
  const newEvent = { ...event }; // Shallow Copy

  if (!event.slots) {
    return { ...event } as Event;
  }

  newEvent.slots = event.slots.map((slot: Slot) => {
    const signup = event.signups.find(signup => signup.uuid === slot.signup_uuid);

    if (!signup) {
      // At this point in the migration, signups are the source of truth.
      // If a slot is missing its associated signup, keep it but mark it clearly.
      const fallbackSignup: EventSignup = {
        uuid: slot.signup_uuid ?? "",
        name: "Unknown Name",
        dj_refs: [],
        is_debut: false,
        requested_duration: 1,
        type: SlotType.LIVE,
      };
      return {
        ...slot,
        name: fallbackSignup.name,
        reconciled: { signup: fallbackSignup, djs: [] },
      };
    }

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

        return result;
      }
    );

    const getDjInfoFromLegacySlot = () => {
      return [];
    };

  const djs = signup ? getDjInfoFromSignups(signup) : getDjInfoFromLegacySlot();

    return {
      ...slot,
      name: signup?.name,
      reconciled: {
        signup,
        djs: djs ?? [],
      },
    };
  });

  return newEvent;
};

/**
 * Calculates the start and end times for each slot in the event.
 * @param event - The event containing slots.
 * @returns The event with updated slot times and end time.
 */
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
};

/**
 * Sets the DJ plays for the event based on slot data.
 * @param event - The event containing slots.
 * @returns The event with updated DJ plays.
 */
const setDjPlays = (event: Event): Event => {
  if (!event.slots) {
    return {
      ...event,
      dj_plays: []
    } as Event;
  }

  const newDjPlays = event.slots.map(slot => slot.reconciled.signup.dj_refs).flat();

  const dj_plays = newDjPlays;

  return {
    ...event,
    dj_plays,
  } as Event;
};

/**
 * Reconciles host information for the event from host_ref.
 * @param event - The event containing host_ref.
 * @param hostCache - Optional cache of Host data.
 * @returns The event with reconciled host information.
 */
const reconcileHost = (event: Event, hostCache?: HostCache): Event => {
  if (!event.host_ref) {
    return event;
  }

  const hostId = event.host_ref.id;
  const cachedHost = hostCache?.get(hostId);

  if (cachedHost) {
    return {
      ...event,
      reconciled: {
        ...event.reconciled,
        host: cachedHost,
      },
    };
  }

  // If not in cache, return event as-is. The host will need to be fetched separately.
  // This maintains the same pattern as DJ reconciliation where cache is expected to be populated.
  return event;
};

