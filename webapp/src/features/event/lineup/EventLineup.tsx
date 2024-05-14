import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { RESIDENT_DJS } from "../../../store/resident_djs";
import { Dj, Slot, SlotType } from "../../../util/types";
import { useEventOperations } from "../EventRoot";
import SortableDjList from "./SortableDjList";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    
    const addSlot = (slot: Slot) => {
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
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
            <SortableDjList />
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
        slotType: SlotType.LIVE,
        mediaSourceUrl: "",
        isDebutt: false,
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
        discord_username: "",
        name: "",
        twitch_url: "",
    });

    const newDjTimeSlot = (dj: Dj): Slot => ({
        dj,
        duration: 1,
        slotType: SlotType.LIVE,
        mediaSourceUrl: "",
        isDebutt: false,
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
