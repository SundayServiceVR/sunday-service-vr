import { Event, EventSignup, Slot } from "../../../util/types";
import EventLineupSlot from "./EventLineupSlot";
import { useEventOperations } from "../outletContext";

type Props = {
  event: Event;
  onUpdateSignup: (signup: EventSignup) => void;
};

const EventLineupSortableList = ({ event, onUpdateSignup }: Props) => {
  const [, proposeEventChange] = useEventOperations();

  const getSignupForSlot = (slot: Slot): EventSignup | undefined =>
    event.signups.find((s) => s.uuid === slot.signup_uuid);

  const removeSlot = (slot: Slot) => {
    const newSlots = event.slots.filter((s) => s.signup_uuid !== slot.signup_uuid);
    proposeEventChange({ ...event, slots: newSlots });
  };

  const moveSlot = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= event.slots.length) return;

    const newSlots = [...event.slots];
    const temp = newSlots[index];
    newSlots[index] = newSlots[newIndex];
    newSlots[newIndex] = temp;
    proposeEventChange({ ...event, slots: newSlots });
  };

  const updateSlot = (newSlot: Slot) => {
    const newSlots = event.slots.map((s) =>
      s.signup_uuid === newSlot.signup_uuid ? newSlot : s
    );
    proposeEventChange({ ...event, slots: newSlots });
  };

  return (
    <div>
      {event.slots.map((slot, index) => {
        const signup = getSignupForSlot(slot);

        if (!signup) {
          return null;
        }

        return (
          <EventLineupSlot
            key={slot.signup_uuid ?? index}
            index={index}
            slot={slot}
            signup={signup}
            event={event}
            onSlotMoveSooner={() => moveSlot(index, "up")}
            onSlotMoveLater={() => moveSlot(index, "down")}
            onRemoveSlot={() => removeSlot(slot)}
            onUpdateSlot={updateSlot}
            onUpdateSignup={onUpdateSignup}
          />
        );
      })}
    </div>
  );
};

export default EventLineupSortableList;
