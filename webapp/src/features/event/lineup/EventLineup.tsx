import { useState } from "react";
import { Button, ButtonGroup, Col, Container, Row, Stack, Form, Modal, Card } from "react-bootstrap";
import { Dj, Event, EventSignup, Slot, SlotDuration, SlotType } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import { Link } from "react-router-dom";
import EventLineupSortableList from "./EventLineupSortableList";
import { DocumentReference } from "firebase/firestore";
import { EventDjSignups } from "./EventSignupList";
import { v4 as uuidv4 } from 'uuid';
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import { AddOrCreateDjModal } from "./components/AddOrCreateDjModal";
import { updateSignupForEvent } from "../util";
import { useReconciledEvent } from "../../../hooks/useEventStore/useReconciledEvent";
import { getProposedLineupMessage } from "../../../util/messageWriters";
import MessagePasteCard from "../../../components/MessagePasteCard";

type ViewMode = "signups" | "build" | "lineup";

const EventLineup = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const [createDjModalShow, setCreateDjModalShow] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("build");

    const { reloadDj, djCache } = useEventDjCache();

    const reconciledEvent = useReconciledEvent(eventScratchpad, djCache);
    const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);

    const updateSignup = (event: Event, new_signup: EventSignup) => {
        const new_event = updateSignupForEvent(event, new_signup);
        proposeEventChange(new_event);
    };

    const addSlotToLineup = (signup: EventSignup) => {
        const slot: Slot = {
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
                <Stack direction="horizontal" gap={3}>
                    <div className="ms-auto d-flex align-items-center">
                        <ButtonGroup>
                            <Button
                                variant={viewMode === "signups" ? "primary" : "outline-primary"}
                                onClick={() => setViewMode("signups")}
                            >
                                All Signups
                            </Button>
                            <Button
                                variant={viewMode === "build" ? "primary" : "outline-primary"}
                                onClick={() => setViewMode("build")}
                            >
                                Build Lineup
                            </Button>
                            <Button
                                variant={viewMode === "lineup" ? "primary" : "outline-primary"}
                                onClick={() => setViewMode("lineup")}
                            >
                                Lineup
                            </Button>
                        </ButtonGroup>
                    </div>
                </Stack>
            </Col>
        </Row>
        
        <Row className="mt-3">
            {(viewMode === "signups" || viewMode === "build") && (
                <Col md={{ span: viewMode === "build" ? 6 : 12 }}>
                    <h3 className="display-6">Signups</h3>
                    <Card className="p-2 mb-3" border="light" style={{ minWidth: 220 }}>
                        <div className="d-flex align-items-center">
                            <Form.Check
                                type="switch"
                                id="signups-open-switch"
                                label="Signups Open"
                                className="me-3"
                                checked={!!eventScratchpad?.signupsAreOpen}
                                onChange={(e) => {
                                    const checked = (e.target as HTMLInputElement).checked;
                                    proposeEventChange({ ...eventScratchpad, signupsAreOpen: checked });
                                }}
                            />
                            {eventScratchpad?.id && eventScratchpad?.signupsAreOpen && (
                                <Link to={`/eventSignup/${eventScratchpad.id}`} target="_blank" rel="noreferrer" className="btn btn-link me-3">
                                    (<em>View Signup Page</em>)
                                </Link>
                            )}

                            {!eventScratchpad?.signupsAreOpen && (viewMode === "build") && (
                                <Button variant="primary" size="sm" className="ms-2" onClick={() => setShowVerifyModal(true)}>
                                    Verify Lineup
                                </Button>
                            )}
                        </div>
                    </Card>
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
                                hideLineupSignups={viewMode === "build"}
                                onAddDjToSignups={() => setCreateDjModalShow(true)}
                            />
                        </Row>
                    </Container>
                </Col>
            )}
            {(viewMode === "lineup" || viewMode === "build") && (
                <Col md={{ order: 1, span: viewMode === "build" ? 6 : 12 }}>
                    <h3 className="display-6">Lineup (Local Times)</h3>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            Event Start Time <small className="text-muted">(Your Local Time)</small>
                        </Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={(() => {
                                const date = new Date(eventScratchpad.start_datetime);
                                const offset = date.getTimezoneOffset() * 60 * 1000;
                                const localDate = new Date(date.getTime() - offset);
                                return localDate.toISOString().slice(0, 16);
                            })()}
                            onChange={(e) => {
                                const newStartTime = new Date(e.target.value);
                                proposeEventChange({ ...eventScratchpad, start_datetime: newStartTime });
                            }}
                        />
                    </Form.Group>
                    <EventLineupSortableList
                        event={reconciledEvent}
                        onUpdateSignup={(newSignup: EventSignup) => updateSignup(eventScratchpad, newSignup)}
                    />
                </Col>
            )}
        </Row>
        <AddOrCreateDjModal
            show={createDjModalShow}
            handleClose={() => setCreateDjModalShow(false)}
            onDjSelected={addSignup}
        />
        <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Verify Lineup</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Copy the message below and paste it into the scheduling channel in Discord to verify DJs' availability.</p>
                <MessagePasteCard message={getProposedLineupMessage(eventScratchpad)} footerInstructions={
                    <>
                        <p className="mb-0">Paste this message to <a target="_blank" rel="noopener noreferrer" href="https://discord.com/channels/1004489038159413248/1204320477732929566">#scheduling</a> in Discord, then react to your message so DJs can confirm.</p>
                        <p className="mt-2 mb-0">You can also open the full Verify DJs page for more options.</p>
                    </>
                } />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    </Container>;
};

export default EventLineup;
