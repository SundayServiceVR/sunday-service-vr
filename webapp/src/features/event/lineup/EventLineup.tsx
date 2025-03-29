import { useState } from "react";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { Dj, EventSignup, Slot, SlotDuration, SlotType } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import LineupSlotSortableList from "./LineupSlotSortableList";
import { DjSearchSelect } from "../../dj/DjSearchSelect";
import { DocumentReference } from "firebase/firestore";
import { EventDjSignups } from "./EventSignupList";
import {v4 as uuidv4} from 'uuid';
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import { AddOrCreateDjModal } from "./Components/AddOrCreateDjModal";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const [createDjModalShow, setcreateDjModalShow] = useState<boolean>(false);

    const { djCache } = useEventDjCache();

    const addSlotFromSignup = (signup: EventSignup) => {
        const slot: Slot = {
            dj_ref: signup.dj_refs[0],
            duration: signup.requested_duration,
            start_time: new Date(),
            signup_uuid: signup.uuid,
        }
        setcreateDjModalShow(false);
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const addSignup = (_: Dj, djRef: DocumentReference, isDebut: boolean = false) => {
        setcreateDjModalShow(false);
        const signups_copy = [...eventScratchpad.signups, {
            dj_refs: [djRef],
            name: djCache.get(djRef.id)?.dj_name ?? "Unknown Dj",
            debut: isDebut,
            uuid: uuidv4(),
            requested_duration: 1 as SlotDuration,
            type: SlotType.LIVE,
         } as EventSignup];
        proposeEventChange({ ...eventScratchpad, signups: signups_copy });
    }

    const removeSignup = (signup: EventSignup) => {
        const signups_copy = eventScratchpad.signups.filter(dj_signup => dj_signup.uuid !== signup.uuid); 
        proposeEventChange({ ...eventScratchpad, signups: signups_copy });
    }

    const updateSignup = (signup: EventSignup) => {
        const signups_copy = eventScratchpad.signups.filter(dj_signup => dj_signup.uuid !== signup.uuid); 
        proposeEventChange({ ...eventScratchpad, signups: [...signups_copy, signup] });
    }

    // const removeSlotFromLineup = (deleted_slot: Slot) => {
    //     const slots_copy = eventScratchpad.slots.filter(slot => deleted_slot.dj_ref.id !== slot.dj_ref.id);
    //     proposeEventChange({ ...eventScratchpad, slots: slots_copy });
    // }

    return <Container>
        <Container>
            <Row>
                <Col md={{ span: 6 }}>
                    <h3 className="display-6">Signups</h3>
                    <Container>
                        <Row className="mb-3">
                            <Col className="d-flex flex-column align-items-center">
                                <Stack direction="horizontal" gap={2}>
                                    <div className="flex-grow-1">
                                        <DjSearchSelect onDjSelect={addSignup}/>
                                    </div>
                                    <div className="vr" />
                                    <Button variant="primary" onClick={() => setcreateDjModalShow(true)} className="flex-grow-1">Onboard a New DJ</Button>
                                </Stack>
                            </Col>
                        </Row>
                        <Row>
                            <EventDjSignups event={eventScratchpad}  onUpdateSignup={updateSignup} onAddSlotToLineup={addSlotFromSignup} onRemoveSignup={removeSignup} />
                        </Row>
                    </Container>
                </Col>
                <Col md={{ order: 1, span: 6 }}>
                    <h3 className="display-6">Lineup (Local Times)</h3>
                    <LineupSlotSortableList onUpdateSignup={updateSignup}/>
                </Col>
            </Row>
        </Container>
        <AddOrCreateDjModal show={createDjModalShow} handleClose={() => setcreateDjModalShow(false)} onDjSelected={addSignup} />
    </Container>;
};

export default EventLineup;
