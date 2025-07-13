import { useState } from "react";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { Dj, Event, EventSignup, Slot, SlotDuration, SlotType } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import EventLineupSortableList from "./EventLineupSortableList";
import { DocumentReference } from "firebase/firestore";
import { EventDjSignups } from "./EventSignupList";
import { v4 as uuidv4 } from 'uuid';
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import { AddOrCreateDjModal } from "./components/AddOrCreateDjModal";
import { updateSignupForEvent } from "../util";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const [createDjModalShow, setCreateDjModalShow] = useState<boolean>(false);

    const { reloadDj } = useEventDjCache();

    const addSlotToLineup = (signup: EventSignup) => {
        const slot: Slot = {
            dj_ref: signup.dj_refs[0],
            duration: signup.requested_duration,
            start_time: new Date(),
            signup_uuid: signup.uuid,
            // stream_source_type: signup.type ?? StreamSourceType.MANUAL as SlotType,
            stream_source_url: signup.event_signup_form_data?.stream_link,
            reconciled: {
                signup
            }
        }
        setCreateDjModalShow(false);
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({ ...eventScratchpad, slots: slots_copy });
    }

    const addSignup = async (_: Dj, djRef: DocumentReference) => {
        const dj = await reloadDj(djRef.id); // Need to reload so other components have access to any created djs.
        setCreateDjModalShow(false);
        const isDebut = false;
        const signups_copy = [...eventScratchpad.signups, {
            dj_refs: [djRef],
            name: dj?.dj_name,
            is_debut: isDebut,
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

    const updateSignup = (event: Event, signup: EventSignup) => {
        proposeEventChange(updateSignupForEvent(event, signup));
    }

    return <Container>
        <Container>
            <Row className="mb-3">
                <Col className="d-flex flex-column align-items-center">
                    <Stack direction="horizontal" gap={2}>
                        <div className="ms-auto" />
                        <Button variant="primary" onClick={() => setCreateDjModalShow(true)}>Add DJ to Signups</Button>
                    </Stack>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6 }}>
                    <h3 className="display-6">Signups</h3>
                    <Container>
                        <Row>
                            <EventDjSignups
                                event={eventScratchpad}
                                onUpdateSignup={(newSignup) => updateSignup(eventScratchpad, newSignup)}
                                onAddSlotToLineup={addSlotToLineup}
                                onRemoveSignup={removeSignup}
                            />
                        </Row>
                    </Container>
                </Col>
                <Col md={{ order: 1, span: 6 }}>
                    <h3 className="display-6">Lineup (Local Times)</h3>
                    <EventLineupSortableList
                        onUpdateSignup={(newSignup) => updateSignup(eventScratchpad, newSignup)}
                    />
                </Col>
            </Row>
        </Container>
        <AddOrCreateDjModal show={createDjModalShow} handleClose={() => setCreateDjModalShow(false)} onDjSelected={addSignup} />
    </Container>;
};

export default EventLineup;
