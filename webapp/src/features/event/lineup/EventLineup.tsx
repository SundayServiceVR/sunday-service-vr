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
        }
        setAddDjModalShow(false);
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const addDjToSignups = (_: Dj, documentRef: DocumentReference) => {
        setAddDjModalShow(false);
        const currentSignups = eventScratchpad.dj_signups ?? [];
        const otherSignups = currentSignups.filter(dj_ref => dj_ref.id !== documentRef.id);
        const signups_copy = [...otherSignups, documentRef];
        proposeEventChange({ ...eventScratchpad, dj_signups: signups_copy });
    }

    const removeDjFromSignups = (deleted_dj_ref: DocumentReference) => {
        const signups_copy = eventScratchpad.dj_signups.filter(dj_ref => dj_ref.id !== deleted_dj_ref.id); 
        proposeEventChange({ ...eventScratchpad, dj_signups: signups_copy });
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
                            <EventDjSignups dj_refs={eventScratchpad.dj_signups ?? []} event={eventScratchpad} onAddDjToLineup={addNewDjAsSlot} onRemoveDj={removeDjFromSignups} />
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
