import { Stack, Button, Form, Container, Row, Col, ButtonGroup, ToggleButton, InputGroup } from "react-bootstrap";
import { Dj, Slot, SlotDuration, SlotType } from "../../../util/types";

type Props = {
    index: number,
    dj: Dj,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onRemoveSlot: () => void,
    onUpdateSlot: (newSlot: Slot) => void,
}

const SortableDj = ({
    index,
    dj,
    slot,
    onSlotMoveSooner,
    onSlotMoveLater,
    onRemoveSlot,
    onUpdateSlot,
}: Props) =>
    {
        return <Container className="my-2">
            <Row>
                <Col xs={3} sm={1}>
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
                </Col>
                <Col xs={6} sm={10}>
                    <Row className="mb-3">
                        <Col>
                            <Stack gap={3} direction="horizontal">
                                <span className="lead">{dj.name}</span>
                                <span className="lead text-muted">({slot.startTime?.toLocaleTimeString()})</span>
                            </Stack>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={9} lg={10}>
                            <Form.Group as={Row}  className="mb-3">
                                <Form.Label column sm={4}>Slot Length (In Hours)</Form.Label>
                                <Col>
                                    <Form.Control
                                        type={"number"}
                                        step={0.5}
                                        value={slot.duration}
                                        onChange={(event) => { onUpdateSlot({...slot, duration: parseFloat(event.target.value) as SlotDuration})}}
                                        min={0}
                                        max={4}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}  className="mb-3">
                                <Form.Label column sm={4} className="text-right">Set Type</Form.Label>
                                <ButtonGroup className="mb-2">
                                    <ToggleButton
                                        id={`slot-${index}-rtmp`}
                                        key={`slot-${index}-rtmp`}
                                        type="radio"
                                        variant="outline-dark"
                                        name={`slot-${index}-slotType`}
                                        value={SlotType.RTMP}
                                        checked={slot.slotType === SlotType.RTMP}
                                        onChange={(e) => onUpdateSlot({...slot, slotType: SlotType.RTMP})}
                                    >
                                        VRCDN/RTMP
                                    </ToggleButton>
                                    <ToggleButton
                                        id={`slot-${index}-twitch`}
                                        key={`slot-${index}-twitch`}
                                        type="radio"
                                        variant="outline-dark"
                                        name={`slot-${index}-slotType`}
                                        value={SlotType.TWITCH}
                                        checked={slot.slotType === SlotType.TWITCH}
                                        onChange={(e) => onUpdateSlot({...slot, slotType: SlotType.TWITCH})}
                                    >
                                        Twitch
                                    </ToggleButton>
                                    <ToggleButton
                                        id={`slot-${index}-prerecord`}
                                        key={`slot-${index}-prerecord`}
                                        type="radio"
                                        variant="outline-dark"
                                        name={`slot-${index}-slotType`}
                                        value={SlotType.PRERECORD}
                                        checked={slot.slotType === SlotType.PRERECORD}
                                        onChange={(e) => onUpdateSlot({...slot, slotType: SlotType.PRERECORD})}
                                    >
                                        PreRecord
                                    </ToggleButton>
                                </ButtonGroup>
                          
                                <Form.Control
                                    type={"input"}
                                    value={slot.mediaSourceUrl}
                                    onChange={(event) => { onUpdateSlot({...slot, mediaSourceUrl: event.target.value})}}
                                    placeholder="Media Source (RTMP/URL)"
                                    hidden={![SlotType.PRERECORD, SlotType.RTMP].includes(slot.slotType)}
                                />
                       
                                <InputGroup className="mb-2"  hidden={slot.slotType !== SlotType.TWITCH}>
                                    <InputGroup.Text>https://www.twitch.tv/</InputGroup.Text>
                                    <Form.Control
                                        type={"input"}
                                        value={slot.twitchUserName}
                                        onChange={(event) => { onUpdateSlot({...slot, twitchUserName: event.target.value})}}
                                        placeholder="username"
                                    />
                                </InputGroup>
                    
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3">
                                <Form.Label  column >Is Debutt?</Form.Label>
                                <Col>
                                    <Form.Check
                                        className="mt-2" 
                                        type="switch" 
                                        checked={slot.isDebutt} 
                                        onChange={(event) => { onUpdateSlot({...slot, isDebutt: event.target.checked})}}
                                    /> 
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
                <Col  xs={3} sm={1}>
                    <Button onClick={() => { onRemoveSlot(); }} variant="outline-danger">x</Button>
                </Col>
            </Row>
        </Container>;
    }

export default SortableDj;