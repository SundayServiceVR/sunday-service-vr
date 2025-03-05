import { Stack, Form, Container, Row, Col, ButtonGroup, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { Slot, SlotType, StreamSourceType } from "../../../util/types";

type Props = {
    index: number,
    slot: Slot,
    onUpdateSlot: (newSlot: Slot) => void,
}

const EventSlotTechnicalDetails = ({
    index,
    slot,
    onUpdateSlot,
}: Props) => {
    return <Container className="my-2">
        <Row>
            <Col xs={6} sm={10}>
                <Row className="mb-3">
                    <Col>
                        <Stack gap={3} direction="horizontal">
                            <span className="lead text-muted">Slot {index + 1} - {slot.start_time?.toLocaleTimeString()}</span>
                        </Stack>
                    </Col>
                </Row>
            </Col>
            <Col sm={12}>
                <Form.Group>
                    <Form.Label>Slot Name</Form.Label>
                    <Form.Control value={slot.name} onChange={(event) => onUpdateSlot({...slot, name: event.target.value})} />
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={4} className="text-right">Stream Source</Form.Label>
                    <ButtonGroup className="mb-2">
                        <InputGroup className="mb-3">
                            <DropdownButton
                                variant="outline-secondary"
                                title={slot.stream_source_type}
                                onSelect={(streamType) => onUpdateSlot({ ...slot, stream_source_type: streamType as StreamSourceType })}
                            >
                                <Dropdown.Item eventKey={StreamSourceType.VRCDN}>VRCDN</Dropdown.Item>
                                <Dropdown.Item eventKey={StreamSourceType.TWITCH}>Twitch</Dropdown.Item>
                                <Dropdown.Item eventKey={StreamSourceType.RTMP}>RTMP</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item>Manual Link</Dropdown.Item>
                                <Dropdown.Item>PreRecord</Dropdown.Item>
                            </DropdownButton>
                            <Form.Control aria-label="Text input with dropdown button" />
                        </InputGroup>
                    </ButtonGroup>

                    <Form.Control
                        type={"input"}
                        value={slot.rtmp_url}
                        onChange={(event) => { onUpdateSlot({ ...slot, rtmp_url: event.target.value }) }}
                        placeholder="RTMP URL"
                        hidden={slot.slot_type !== SlotType.RTMP}
                    />
                    <Form.Control
                        type={"input"}
                        value={slot.prerecord_url}
                        onChange={(event) => { onUpdateSlot({ ...slot, prerecord_url: event.target.value }) }}
                        placeholder="PreRecord URL"
                        hidden={slot.slot_type !== SlotType.PRERECORD}
                    />

                    <InputGroup className="mb-2" hidden={slot.slot_type !== SlotType.TWITCH}>
                        <InputGroup.Text>https://www.twitch.tv/</InputGroup.Text>
                        <Form.Control
                            type={"input"}
                            value={slot.twitch_username}
                            onChange={(event) => { onUpdateSlot({ ...slot, twitch_username: event.target.value }) }}
                            placeholder="username"
                        />
                    </InputGroup>

                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column >Is Debutt?</Form.Label>
                    <Col>
                        <Form.Check
                            className="mt-2"
                            type="switch"
                            checked={slot.is_debut}
                            onChange={(event) => { onUpdateSlot({ ...slot, is_debut: event.target.checked }) }}
                        />
                    </Col>
                </Form.Group>
            </Col>
        </Row>
    </Container>;
}

export default EventSlotTechnicalDetails;