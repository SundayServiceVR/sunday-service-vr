import React from "react";
import { Dj, Slot } from "../util/types";

type Props = {
    slots: Slot[],
    onSlotsChange: (slots: Slot[]) => void
}




const EventFormSlotList = ({slots, onSlotsChange }: Props) => {

    const swapSlots = (slot_a: number, slot_b: number) => {
        if(slot_a < 0 || slot_a >= slots.length || slot_b < 0 || slot_b >= slots.length){
            return;
        }
        const slots_copy = [...slots];
        [slots_copy[slot_a], slots_copy[slot_b]] = [slots_copy[slot_b], slots_copy[slot_a]];
        onSlotsChange(slots_copy);
    }

    return <ul>
    {slots.map(
        (slot: Slot, index: number) => <SortableDj
            key={`slot-${slot.dj.name}`}
            index={index}
            dj={slot.dj}
            onSlotMoveLater = { ()=>{swapSlots(index, index + 1)} }
            onSlotMoveSooner = { ()=>{swapSlots(index, index - 1)} }
        />
    )}
</ul>;
};

export default EventFormSlotList;

type SortableDjProps = {
    dj: Dj,
    index: number,
    onSlotMoveSooner: () => void,
    onSlotMoveLater:  () => void,
}

const SortableDj = ({dj, index, onSlotMoveSooner, onSlotMoveLater}: SortableDjProps) => <li>
    <button onClick={()=>onSlotMoveSooner()}>-</button>
    <button onClick={()=>onSlotMoveLater()}>+</button>
    {dj.name}
    </li>;

