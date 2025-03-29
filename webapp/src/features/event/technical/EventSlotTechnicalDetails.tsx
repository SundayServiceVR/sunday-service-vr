import { Stack, Form, Container, Row, Col, ButtonGroup, InputGroup, Dropdown, DropdownButton, Button } from "react-bootstrap";
import { Slot, SlotType, StreamSourceType, Dj, Event, EventSignup } from "../../../util/types";

type Props = {
    index: number,
    slot: Slot,
    event: Event,
    djs: Dj[],
    onUpdateSlot: (newSlot: Slot) => void,
    onUpdateSignup: (newSignup: EventSignup) => void,
}

const EventSlotTechnicalDetails = ({
    index,
    slot,
    event,
    djs,
    onUpdateSlot,
}: Props) => {
    const handleSetStreamSource = (streamSource: string, sourceType: StreamSourceType) => {
        onUpdateSlot({ 
            ...slot, 
            stream_source_url: streamSource,
            stream_source_type: sourceType, 
        });
    };

    const signup = event.signups.find(signup => signup.uuid === slot.signup_uuid);

    if(!signup) {
        throw new Error(`Unable to find signup with a uuid of ${slot.signup_uuid}`)
    }


    return (
        <Container className="my-2">
            <Row>
                <Col xs={6} sm={8}>
                    <Row className="mb-3">
                        <Col>
                            <Stack gap={3} direction="horizontal">
                                <span className="lead text-muted">Slot {index + 1} - {slot.start_time?.toLocaleTimeString()}</span>
                            </Stack>
                        </Col>
                    </Row>
                    <Form.Group>
                        <Form.Label>Slot Name</Form.Label>
                        <Form.Control value={signup.name} onChange={(event) => onUpdateSlot({ ...slot, name: event.target.value })} />
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
                                    <Dropdown.Item eventKey={StreamSourceType.PRERECORD}>PreRecord</Dropdown.Item>
                                    <Dropdown.Item eventKey={StreamSourceType.MANUAL}>Manual</Dropdown.Item>
                                </DropdownButton>
                                <Form.Control
                                type={"input"}
                                value={slot.stream_source_url}
                                onChange={(event) => { onUpdateSlot({ ...slot, stream_source_url: event.target.value }) }}
                                />
                            </InputGroup>
                        </ButtonGroup>
                    </Form.Group>
                </Col>
                <Col xs={6} sm={4}>
                    <h5>Set Stream Information</h5>
                    {djs.map((dj, index) => (
                        <div key={index} className="mb-3">
                            <Row>
                                <Col xs={4}>
                                    <strong>Stream Link:</strong>
                                </Col>
                                <Col xs={8}>
                                    <Button
                                        variant="link"
                                        onClick={() => handleSetStreamSource(dj.rtmp_url ?? "", StreamSourceType.RTMP)}
                                    >
                                        {dj.rtmp_url || "N/A"}
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    <strong>Twitch Username:</strong>
                                </Col>
                                <Col xs={8}>
                                    <Button
                                        variant="link"
                                        onClick={() => handleSetStreamSource(dj.twitch_username ?? "", StreamSourceType.TWITCH)}
                                    >
                                        {dj.twitch_username || "N/A"}
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </Col>
            </Row>
        </Container>
    );
}

export default EventSlotTechnicalDetails;