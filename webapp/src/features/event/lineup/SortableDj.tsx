import { Stack, Button, Form, Container, Row, Col, ButtonGroup, ToggleButton, InputGroup } from "react-bootstrap";
import { Slot, SlotDuration, SlotType } from "../../../util/types";

type Props = {
    index: number,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onRemoveSlot: () => void,
    onUpdateSlot: (newSlot: Slot) => void,
}

const SortableDj = ({
    index,
    slot,
    onSlotMoveSooner,
    onSlotMoveLater,
    onRemoveSlot,
    onUpdateSlot,
}: Props) => {
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
                                <span className="lead">{slot.dj_name}</span>
                                <span className="lead text-muted">({slot.start_time?.toLocaleTimeString()})</span>
                            </Stack>
                        </Col>
                    </Row>
                </Col>
                <Col xs={3} sm={1}>
                    <div className="display-flex justify-content-center">
                        <Button onClick={() => { onRemoveSlot(); }} variant="outline-danger">x</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col sm={12} md={{ span: 10, offset: 1}} lg={{span: 8, offset: 2}} lg-skip>
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
                                checked={slot.slot_type === SlotType.RTMP}
                                onChange={() => onUpdateSlot({...slot, slot_type: SlotType.RTMP})}
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
                                checked={slot.slot_type === SlotType.TWITCH}
                                onChange={() => onUpdateSlot({...slot, slot_type: SlotType.TWITCH})}
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
                                checked={slot.slot_type === SlotType.PRERECORD}
                                onChange={() => onUpdateSlot({...slot, slot_type: SlotType.PRERECORD})}
                            >
                                PreRecord
                            </ToggleButton>
                        </ButtonGroup>
                    
                        <Form.Control
                            type={"input"}
                            value={slot.rtmp_url}
                            onChange={(event) => { onUpdateSlot({...slot, rtmp_url: event.target.value})}}
                            placeholder="Media Source (RTMP/URL)"
                            hidden={!([SlotType.PRERECORD, SlotType.RTMP] as Array<SlotType|undefined>).includes(slot.slot_type)}
                        />
                
                        <InputGroup className="mb-2"  hidden={slot.slot_type !== SlotType.TWITCH}>
                            <InputGroup.Text>https://www.twitch.tv/</InputGroup.Text>
                            <Form.Control
                                type={"input"}
                                value={slot.twitch_username}
                                onChange={(event) => { onUpdateSlot({...slot, twitch_username: event.target.value})}}
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
                                checked={slot.is_debut} 
                                onChange={(event) => { onUpdateSlot({...slot, is_debut: event.target.checked})}}
                            /> 
                        </Col>
                    </Form.Group>
                </Col>
            </Row>
        </Container>;
    }

export default SortableDj;