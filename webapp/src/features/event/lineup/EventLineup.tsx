import { useState } from "react";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { Dj, Slot } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import SortableDjList from "./SortableDjList";
import { DjSearchSelect } from "../../dj/DjSearchSelect";
import { CreateDjModal } from "../../dj/CreateDjModal";
import { DocumentReference } from "firebase/firestore";
import { EventDjSignups } from "./EventDjSignups";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const [addDjModalShow, setAddDjModalShow] = useState<boolean>(false);

    const addNewDjAsSlot = (documentRef: DocumentReference, slot_name: string, is_debut: boolean) => {
        const slot: Slot = {
            dj_ref: documentRef,
            dj_name: slot_name,
            prerecord_url: "",
            duration: 1,
            is_debut,
            rtmp_url: "",
            twitch_username: "",
        }
        setAddDjModalShow(false);
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const addDjToSignups = (_: Dj, documentRef: DocumentReference) => {
        setAddDjModalShow(false);
        const currentSignups = eventScratchpad.signups ?? [];
        const otherSignups = currentSignups.filter(dj_signup => dj_signup.dj_ref.id !== documentRef.id);
        const signups_copy = [...otherSignups, { dj_ref: documentRef }];
        proposeEventChange({ ...eventScratchpad, signups: signups_copy });
    }

    const removeDjFromSignups = (deleted_dj_ref: DocumentReference) => {
        const signups_copy = eventScratchpad.signups.filter(dj_signup => dj_signup.dj_ref.id !== deleted_dj_ref.id); 
        proposeEventChange({ ...eventScratchpad, signups: signups_copy });
    }

    const removeDjFromLineup = (deleted_dj_ref: DocumentReference) => {
        const slots_copy = eventScratchpad.slots.filter(slot => slot.dj_ref.id !== deleted_dj_ref.id);
        proposeEventChange({ ...eventScratchpad, slots: slots_copy });
    }

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
                                        <DjSearchSelect onDjSelect={addDjToSignups}/>
                                    </div>
                                    <div className="vr" />
                                    <Button variant="primary" onClick={() => setAddDjModalShow(true)} className="flex-grow-1">Onboard a New DJ</Button>
                                </Stack>

                            </Col>
                        </Row>
                        <Row>
                            <EventDjSignups event={eventScratchpad} onAddDjToLineup={addNewDjAsSlot} onRemoveDjFromLineup={removeDjFromLineup} onRemoveDjFromSignups={removeDjFromSignups} />
                        </Row>
                    </Container>
                </Col>
                <Col md={{ order: 1, span: 6 }}>
                    <h3 className="display-6">Lineup (Local Times)</h3>
                    <SortableDjList />
                </Col>
            </Row>
        </Container>
        <CreateDjModal show={addDjModalShow} handleClose={() => setAddDjModalShow(false)} onDjCreated={addDjToSignups} />
    </Container>;
};

export default EventLineup;
