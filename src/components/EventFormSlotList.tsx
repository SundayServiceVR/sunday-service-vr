import React, { useState } from "react";
import { Block, Button, Columns, Form} from "react-bulma-components";
import { RESIDENT_DJS } from "../util/constants";
import { Dj, Slot, SlotDuration } from "../util/types";

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

    const setSlotLength = (slot_index: number, duration: SlotDuration) => {
        const slots_copy = [...slots];
        slots_copy[slot_index].duration = duration;
        onSlotsChange(slots_copy);
    }

    const removeSlot = (slot_index: number) => {
        const slots_copy = [...slots];
        slots_copy.splice(slot_index, 1);  //delete slots_copy[slot_index];
        onSlotsChange(slots_copy);
    }

    const addSlot = (slot: Slot) => {
        const slots_copy = [...slots, slot];
        onSlotsChange(slots_copy);
    }

    return <>
    <Block>
        <Columns>
            <Columns.Column>
                <ResidentDjs onAddSlot={(slot: Slot) => {addSlot(slot);}} currentSlots={slots}/>
            </Columns.Column>
            <Columns.Column>
                <CustomDjSlotInserter onAddSlot={(slot: Slot) => {addSlot(slot);}}/>
            </Columns.Column>
        </Columns>
    </Block>
    <Block>
        {slots.map(
            (slot: Slot, index: number) => <SortableDj
                key={`slot-${slot.dj.name}`}
                index={index}
                dj={slot.dj}
                slot={slot}
                onSlotMoveLater = { ()=>{swapSlots(index, index + 1);} }
                onSlotMoveSooner = { ()=>{swapSlots(index, index - 1);} }
                onSetSlotLength = { (duration: SlotDuration) => {setSlotLength(index, duration);}}
                onRemoveSlot = { ()=>{removeSlot(index);} }
            />
        )}
    </Block>
    
</>;
};

export default EventFormSlotList;

type ReseidentDjsProps = {
    onAddSlot: (slot: Slot)=>void,
    currentSlots: Slot[],
}

const ResidentDjs = ({onAddSlot, currentSlots}: ReseidentDjsProps)=>{

    const newDjTimeSlot = (dj: Dj): Slot => ({
        dj,
        duration: 1,
    });

    // TODO:  Duplicate dj's seems to break the list.  We can easilly reproduce that behavior here.
    const freeDjs = Object.entries(RESIDENT_DJS).map(([djName, dj]) => dj).filter(
        (dj) => !currentSlots.map(slot => slot.dj).includes(dj)
    );

    return <Block>
        <Block><span className="is-size-5">Add Resident DJ</span></Block>
        {
            Object.entries(freeDjs).map(([dj_name, dj], i) => {
                return <Button key={`add-${dj_name}-button`} onClick={()=>{onAddSlot(newDjTimeSlot(dj))}}>{dj.name}</Button>
            })
        }
        
    </Block>
}

type CustomDjSlotInserterProps = {
    onAddSlot: (slot: Slot)=>void,
}

const CustomDjSlotInserter = ({onAddSlot}: CustomDjSlotInserterProps)=>{

    const [guestDj, setGuestDj] = useState<Dj>({
        name: "",
        twitch_url: "",
    });

    const newDjTimeSlot = (dj: Dj): Slot => ({
        dj,
        duration: 1,
    });

    const addGuestDj = (dj: Dj) => {
        onAddSlot(newDjTimeSlot(guestDj));
    }

    return <Block>
        <form>
        <span className="is-size-5">Add Guest DJ</span>
        <Form.Field>
        <Form.Control>
            <Form.Label>Name</Form.Label>
            <Form.Input value={guestDj.name}  onChange={event => setGuestDj({...guestDj, name: event.target.value})} />
        </Form.Control>
        </Form.Field>
        <Form.Field>
        <Form.Control>
            <Form.Label>Twitch URL</Form.Label>
            <Form.Input value={guestDj.twitch_url} onChange={event => setGuestDj({...guestDj, twitch_url: event.target.value})} />
        </Form.Control>
        </Form.Field>
        <Button onClick={() => { addGuestDj(guestDj)}} color={"primary"}>Add</Button>
        </form>
    </Block>;
}

type SortableDjProps = {
    dj: Dj,
    index: number,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater:  () => void,
    onSetSlotLength: (duration: SlotDuration) => void,
    onRemoveSlot: () => void,
}

const SortableDj = ({
        dj,
        slot,
        onSlotMoveSooner,
        onSlotMoveLater,
        onSetSlotLength,
        onRemoveSlot
    }: SortableDjProps) => <div className="is-flex is-flex-direction-row is-align-items-center">
        <span className="is-flex is-flex-direction-column my-1">
            <Button className="is-flex-grow-1" color={"primary"} size={"small"} onClick={()=>onSlotMoveSooner()}>
                <i><span className="is-size-5 is-bold">-</span></i>
            </Button>
            <Button className="is-flex-grow-11" color={"primary"} size={"small"} onClick={()=>onSlotMoveLater()}>
                <i><span className="is-size-5 is-bold">+</span></i>
            </Button>
        </span>
        <span className="mx-1">
            { slot.startTime?.toLocaleTimeString() }
        </span>
        <span className="is-size-4 is-flex-grow-1 mx-1">
            {dj.name}
        </span>
        <span className="mx-1">
            <Form.Field horizontal>
                <Form.Control>
                <Form.Input
                    type={"number"}
                    step={0.5}
                    value={slot.duration}
                    onChange={(event) => { onSetSlotLength(parseFloat(event.target.value) as SlotDuration)}}
                    min={0}
                    max={4}
                />
                </Form.Control>
            </Form.Field>
            
            
        </span>
        <span className="mx-1">
            <Button remove onClick={()=>{ onRemoveSlot(); }}/>
        </span>
    </div>;
