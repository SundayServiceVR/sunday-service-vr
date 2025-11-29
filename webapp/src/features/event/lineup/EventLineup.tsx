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
import { useReconciledEvent } from "../../../hooks/useEventStore/useReconciledEvent";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const [createDjModalShow, setCreateDjModalShow] = useState<boolean>(false);

    const { reloadDj, djCache } = useEventDjCache();

    const reconciledEvent = useReconciledEvent(eventScratchpad, djCache);

    const updateSignup = (event: Event, new_signup: EventSignup) => {
        const new_event = updateSignupForEvent(event, new_signup);
        proposeEventChange(new_event);
    };

    const addSlotToLineup = (signup: EventSignup) => {
        const slot: Slot = {
            dj_ref: signup.dj_refs[0],
            duration: signup.requested_duration,
            start_time: new Date(),
            signup_uuid: signup.uuid,
            stream_source_url: signup.event_signup_form_data?.stream_link ?? "PRERECORD",
            reconciled: {
                signup
            }
        };
        setCreateDjModalShow(false);
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({ ...eventScratchpad, slots: slots_copy });
    };

    const addSignup = async (_: Dj, djRef: DocumentReference) => {
        const dj = await reloadDj(djRef.id);
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
    };

    return <Container className="mt-3">
        <Row>
            <Col>
                <h1 className="display-6">Event Lineup</h1>
            </Col>
        </Row>
        <Row>
            <Col md={{ span: 6 }}>
                <Stack direction="horizontal" gap={3}>
                    <div className="me-auto" />
                    <Button variant="outline-primary" onClick={() => setCreateDjModalShow(true)}>Add DJ to Signups</Button>
                </Stack>
            </Col>
        </Row>
        <Row>
            <Col md={{ span: 6 }}>
                <h3 className="display-6">Signups</h3>
                <Container>
                    <Row>
                        <EventDjSignups
                            event={reconciledEvent}
                            onUpdateSignup={(newSignup: EventSignup) => updateSignup(eventScratchpad, newSignup)}
                            onAddSlotToLineup={addSlotToLineup}
                            onRemoveSignup={(signup) => {
                                const signups = eventScratchpad.signups.filter(s => s.uuid !== signup.uuid);
                                proposeEventChange({ ...eventScratchpad, signups });
                            }}
                        />
                    </Row>
                </Container>
            </Col>
            <Col md={{ order: 1, span: 6 }}>
                <h3 className="display-6">Lineup (Local Times)</h3>
                <EventLineupSortableList
                    event={reconciledEvent}
                    onUpdateSignup={(newSignup: EventSignup) => updateSignup(eventScratchpad, newSignup)}
                />
            </Col>
        </Row>
        <AddOrCreateDjModal
            show={createDjModalShow}
            handleClose={() => setCreateDjModalShow(false)}
            onDjSelected={addSignup}
        />
    </Container>;
};

export default EventLineup;
