import React, { useState } from "react";
import { Button, Col, Container, Form, ListGroup, ListGroupItem, Row, Stack } from "react-bootstrap";
import { RESIDENT_DJS } from "../../store/resident_djs";
import { Dj, Slot, SlotDuration } from "../../util/types";
import { useEventOperations } from "./EventRoot";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    const swapSlots = (slot_a: number, slot_b: number) => {
        if (slot_a < 0 || slot_a >= eventScratchpad.slots.length || slot_b < 0 || slot_b >= eventScratchpad.slots.length) {
            return;
        }
        const slots_copy = [...eventScratchpad.slots];
        [slots_copy[slot_a], slots_copy[slot_b]] = [slots_copy[slot_b], slots_copy[slot_a]];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const setSlotLength = (slot_index: number, duration: SlotDuration) => {
        const slots_copy = [...eventScratchpad.slots];
        slots_copy[slot_index].duration = duration;
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const removeSlot = (slot_index: number) => {
        const slots_copy = [...eventScratchpad.slots];
        slots_copy.splice(slot_index, 1);  //delete slots_copy[slot_index];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const addSlot = (slot: Slot) => {
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const toggleDebutt = (slot_index: number) => {
        const slots_copy = [...slots];
        slots_copy[slot_index].isDebutt = !slots[slot_index].isDebutt;
        onSlotsChange(slots_copy);
    }

    return <>
        <h3 className="display-6">Add DJs</h3>
        <Container>
            <Row>
                <Col md={8}>
                    <CustomDjSlotInserter onAddSlot={(slot: Slot) => { addSlot(slot); }} />
                </Col>
                <Col>
                    <ResidentDjs onAddSlot={(slot: Slot) => { addSlot(slot); }} currentSlots={eventScratchpad.slots} />
                </Col>
            </Row>
        </Container>

        < hr />
        <div>
            <h3 className="display-6">Schedule</h3>
            <ListGroup variant="flush" >
                {eventScratchpad.slots.map(
                    (slot: Slot, index: number) => <ListGroupItem key={`slot-${index}`} className="py-0">
                        <SortableDj
                            index={index}
                            dj={slot.dj}
                            slot={slot}
                            onSlotMoveLater={() => { swapSlots(index, index + 1); }}
                            onSlotMoveSooner={() => { swapSlots(index, index - 1); }}
                            onSetSlotLength={(duration: SlotDuration) => { setSlotLength(index, duration); }}
                            onRemoveSlot={() => { removeSlot(index); }}
                            onToggleDebutt={() => {toggleDebutt(index)}}
                        />
                    </ListGroupItem>
                )}
            </ListGroup>
        </div>

    </>;
};

export default EventLineup;

type ReseidentDjsProps = {
    onAddSlot: (slot: Slot) => void,
    currentSlots: Slot[],
}

const ResidentDjs = ({ onAddSlot, currentSlots }: ReseidentDjsProps) => {

    const newDjTimeSlot = (dj: Dj): Slot => ({
        dj,
        duration: 1,
        isDebutt: false
    });

    // TODO:  Duplicate dj's seems to break the list.  We can easilly reproduce that behavior here.
    const freeDjs = Object.entries(RESIDENT_DJS).map(([djName, dj]) => dj).filter(
        (dj) => !currentSlots.map(slot => slot.dj).includes(dj)
    );

    return <div>
        <div><span className="is-size-5">(Quick Add Residents)</span></div>
        {
            Object.entries(freeDjs).map(([dj_name, dj], i) => {
                return <Button key={`add-${dj_name}-button`} className="m-1" color="primary" onClick={() => { onAddSlot(newDjTimeSlot(dj)) }}>{dj.name}</Button>
            })
        }

    </div>
}

type CustomDjSlotInserterProps = {
    onAddSlot: (slot: Slot) => void,
}

const CustomDjSlotInserter = ({ onAddSlot }: CustomDjSlotInserterProps) => {

    const [guestDj, setGuestDj] = useState<Dj>({
        name: "",
        twitch_url: "",
    });

    const newDjTimeSlot = (dj: Dj): Slot => ({
        dj,
        duration: 1,
        isDebutt: false
    });

    const addGuestDj = (dj: Dj) => {
        onAddSlot(newDjTimeSlot(guestDj));
    }

    return <div>
        <Form>
            <span className="is-size-5">Guest</span>
            <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="input" value={guestDj.name} onChange={event => setGuestDj({ ...guestDj, name: event.target.value })} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Twitch URL</Form.Label>
                <Form.Control type="input" value={guestDj.twitch_url} onChange={event => setGuestDj({ ...guestDj, twitch_url: event.target.value })} />
            </Form.Group>
            {/* <Form.Check className="mt-2" type="checkbox" label="Debutt?" checked={guestDj.}/> */}
            <Button className="mt-2" onClick={(event: any) => { event.preventDefault(); addGuestDj(guestDj) }} color={"primary"}>Add</Button>
        </Form>
    </div>;
}

type SortableDjProps = {
    dj: Dj,
    index: number,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onSetSlotLength: (duration: SlotDuration) => void,
    onRemoveSlot: () => void,
    onToggleDebutt: () => void,
}

const SortableDj = ({
    dj,
    slot,
    onSlotMoveSooner,
    onSlotMoveLater,
    onSetSlotLength,
    onRemoveSlot,
    onToggleDebutt
}: SortableDjProps) =>
    <Stack className="my-2" direction="horizontal">
        <span style={{ "width": "30px" }}>
            <Stack gap={1}>
                <Button variant={"outline-secondary"} size={"sm"} onClick={() => onSlotMoveSooner()}>
                    <i><span>-</span></i>
                </Button>
                <Button variant={"outline-secondary"} color={"primary"} size={"sm"} onClick={() => onSlotMoveLater()}>
                    <i><span>+</span></i>
                </Button>
            </Stack>
        </span>

        <span className="mx-3">
            {slot.startTime?.toLocaleTimeString()}
        </span>
        <span className="lead mx-3">
            {dj.name}
        </span>
        <span className="mx-auto" />
        <span className="mx-2">
            <Form.Check 
                className="mt-2" 
                type="checkbox" 
                label="Debutt?" 
                checked={slot.isDebutt} 
                onChange={onToggleDebutt}
            /> 
        </span>
        <span className="mx-1">
            <Form.Group>
                <Form.Control
                    type={"number"}
                    step={0.5}
                    value={slot.duration}
                    onChange={(event) => { onSetSlotLength(parseFloat(event.target.value) as SlotDuration) }}
                    min={0}
                    max={4}
                />
            </Form.Group>
        </span>
        <span className="mx-1">
            <Button onClick={() => { onRemoveSlot(); }} variant="outline-danger">x</Button>
        </span>
    </Stack>;
