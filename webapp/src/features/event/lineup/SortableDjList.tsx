import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Slot } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import SortableDj from "./SortableDj";
import { setEventSlotByIndex } from "../util";

const SortableDjList = () => {

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
            (slot: Slot, index: number) => <ListGroupItem key={`slot-${index}`} className="p-1">
                <SortableDj
                    index={index}
                    slot={slot}
                    onSlotMoveLater={() => { swapSlots(index, index + 1); }}
                    onSlotMoveSooner={() => { swapSlots(index, index - 1); }}
                    onRemoveSlot={() => { removeSlot(index); }}
                    onUpdateSlot={(newSlot: Slot) => {updateSlot(index, newSlot)}}
                />
            </ListGroupItem>
        )}
    </ListGroup>
}

export default SortableDjList;