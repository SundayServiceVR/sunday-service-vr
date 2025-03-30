import { ListGroup, ListGroupItem } from "react-bootstrap";
import { EventSignup, Slot } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import LineupEventSlot from "./LineupEventSlot";
import { setEventSlotByIndex } from "../util";

type Props = {
    onUpdateSignup: (newSignup: EventSignup) => void;
}

const LineupSlotSortableList = ({ onUpdateSignup }: Props) => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    const swapSlots = (slot_a: number, slot_b: number) => {
        if (slot_a < 0 || slot_a >= eventScratchpad.slots.length || slot_b < 0 || slot_b >= eventScratchpad.slots.length) {
            return;
        }
        const slots_copy = [...eventScratchpad.slots];
        [slots_copy[slot_a], slots_copy[slot_b]] = [slots_copy[slot_b], slots_copy[slot_a]];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const removeSlot = (slot_index: number) => {
        const slots_copy = [...eventScratchpad.slots];
        slots_copy.splice(slot_index, 1);  //delete slots_copy[slot_index];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const updateSlot = (slot_index: number, newSlot: Slot) => 
        proposeEventChange(
            setEventSlotByIndex(eventScratchpad, slot_index, newSlot)
        );

    return <ListGroup >
        {eventScratchpad.slots.map(
            (slot: Slot, index: number) => {

            const signupForSlot = eventScratchpad.signups.find(signup => signup.uuid === slot.signup_uuid);

            // Legacy support
            if(!signupForSlot) {
                return <ListGroupItem key={`slot-${index}`} className="p-1">
                    <p>Legacy Slot Format</p>
                    <p>Name: {slot.dj_name}</p>
                    <p>Time: {slot.start_time.toLocaleTimeString()}</p>
                    {slot.is_debut ?? <p>Debutt!</p>}
                </ListGroupItem> 

                // // TODO: Error boundary and such
                // return <Alert>
                //     Unable to find signup for slot: Signup with {slot.signup_uuid} should exist but wasn't found.
                //     <Button onClick={() => removeSlot(index)}>Delete</Button>
                // </Alert>
            }

            return <ListGroupItem key={`slot-${index}`} className="p-1">
                <LineupEventSlot
                    index={index}
                    slot={slot}
                    onSlotMoveLater={() => { swapSlots(index, index + 1); }}
                    onSlotMoveSooner={() => { swapSlots(index, index - 1); }}
                    onRemoveSlot={() => { removeSlot(index); }}
                    onUpdateSlot={(newSlot: Slot) => {updateSlot(index, newSlot)}}
                    onUpdateSignup={onUpdateSignup}
                    event={eventScratchpad}
                    signup={signupForSlot}
                />
            </ListGroupItem>
})}
    </ListGroup>
}

export default LineupSlotSortableList;