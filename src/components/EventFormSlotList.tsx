import dayjs from "dayjs";
import React from "react";
import { Block, Box, Button, Form } from "react-bulma-components";
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

    return <>
    {slots.map(
        (slot: Slot, index: number) => <SortableDj
            key={`slot-${slot.dj.name}`}
            index={index}
            dj={slot.dj}
            startTime={slot.startTime}
            onSlotMoveLater = { ()=>{swapSlots(index, index + 1)} }
            onSlotMoveSooner = { ()=>{swapSlots(index, index - 1)} }
        />
    )}
</>;
};

export default EventFormSlotList;

type SortableDjProps = {
    dj: Dj,
    index: number,
    startTime: Date | undefined,
    onSlotMoveSooner: () => void,
    onSlotMoveLater:  () => void,
}

const SortableDj = ({dj, startTime, onSlotMoveSooner, onSlotMoveLater}: SortableDjProps) => <>
    <div className="is-flex is-flex-direction-row is-align-items-center">
        <span className="is-flex is-flex-direction-column">
            <Button className="is-flex-grow-1" color={"primary"} size={"small"} onClick={()=>onSlotMoveSooner()}>
                <i><span className="is-size-5 is-bold">-</span></i>
            </Button>
            <Button className="is-flex-grow-11" color={"primary"} size={"small"} onClick={()=>onSlotMoveLater()}>
                <i><span className="is-size-5 is-bold">+</span></i>
            </Button>
        </span>
        <span>
            { startTime?.toLocaleTimeString() }
        </span>
        <span className="is-size-4">
            {dj.name}
        </span>
    </div>
    </>;

