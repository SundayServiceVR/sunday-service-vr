import { Stack, Button, Form, Container, Row, Col, ButtonGroup, ToggleButton } from "react-bootstrap";
import { Dj, Slot, SlotDuration, SlotType } from "../../../util/types";

type Props = {
    index: number,
    dj: Dj,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onSetSlotLength: (duration: SlotDuration) => void,
    onRemoveSlot: () => void,
    onToggleDebutt: () => void,
    onUpdateSlot: (newSlot: Slot) => void,
}

const SortableDj = ({
    index,
    dj,
    slot,
    onSlotMoveSooner,
    onSlotMoveLater,
    onSetSlotLength,
    onRemoveSlot,
    onToggleDebutt,
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
                    <Row>
                        <Col sm={12} md={3} lg={2}>
                            <Stack gap={3}>
                                <span>{dj.name}</span>
                                <span>{slot.startTime?.toLocaleTimeString()}</span>
                            </Stack>
                        </Col>
                        <Col sm={12} md={9} lg={10}>
                            <Form.Group as={Row}  className="mb-3">
                                <Form.Label column sm={4} className="text-right">Set Type</Form.Label>
                                <Col>
                                <ButtonGroup className="mb-2">
                                    <ToggleButton
                                        id={`slot-${index}-live`}
                                        key={`slot-${index}-live`}
                                        type="radio"
                                        variant="outline-dark"
                                        name={`slot-${index}-slotType`}
                                        value={SlotType.LIVE}
                                        checked={slot.slotType === SlotType.LIVE}
                                        onChange={(e) => onUpdateSlot({...slot, slotType: SlotType.LIVE})}
                                    >
                                        Live
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
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}  className="mb-3">
                                <Form.Label column sm={4}>Media Source URL</Form.Label>
                                <Col>
                                    <Form.Control
                                        type={"input"}
                                        value={slot.mediaSourceUrl}
                                        onChange={(event) => { onUpdateSlot({...slot, mediaSourceUrl: event.target.value})}}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}  className="mb-3">
                                <Form.Label column sm={4}>Slot Length</Form.Label>
                                <Col>
                                    <Form.Control
                                        type={"number"}
                                        step={0.5}
                                        value={slot.duration}
                                        onChange={(event) => { onSetSlotLength(parseFloat(event.target.value) as SlotDuration) }}
                                        min={0}
                                        max={4}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label  column sm={4}>Debutt</Form.Label>
                                <Col>
                                    <Form.Check
                                        className="mt-2" 
                                        type="checkbox" 
                                        checked={slot.isDebutt} 
                                        onChange={onToggleDebutt}
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