import { Stack, Button, Form, Container, Row, Col, ToggleButton, InputGroup } from "react-bootstrap";
import { Slot, SlotDuration, SlotType } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import { ArrowDown, ArrowUp } from "react-feather";


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
            <Col xs={{ order: 1, span: 6 }} md={{ order: 1, span: "auto" }}>
                <span style={{ "width": "30px" }}>
                    <Stack gap={1}>
                        <span className="lead text-muted mb-1">
                            {slot.start_time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Button variant={"outline-secondary"} color={"primary"} size={"sm"} onClick={() => onSlotMoveSooner()}>
                            <ArrowUp />
                        </Button>
                        <Button variant={"outline-secondary"} size={"sm"} onClick={() => onSlotMoveLater()}>
                            <ArrowDown />
                        </Button>

                    </Stack>
                </span>
            </Col>
            <Col xs={{ order: 1, span: 6 }} md={{ order: 3, span: 2 }} lg={1}>
                <ActionMenu
                    className="mb-1 d-flex justify-content-end"
                    options={[
                        {
                            label: "Edit DJ",
                            onClick: () => {
                                window.open(`/djs/${slot.dj_ref.id}`, '_blank', 'noreferrer')?.focus();
                                // navigate(`/djs/${slot.dj_ref.id}`);
                            }
                        },
                        {
                            label: "Remove Slot",
                            onClick: () => { onRemoveSlot(); }
                        }]} />
            </Col>
            <Col xs={{ order: 2, span: 12 }} md={{ order: 2, span: true }} className="pt-3">
                <Form.Group as={Row} className="mb-1">
                    <Form.Label column="sm" sm={2} className="text-md-end">
                        <strong>Name</strong>
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Label column="sm">{slot.dj_name}</Form.Label>
                        {/* <Form.Control
                            size="sm"
                            value={slot.dj_name}
                            defaultValue={1}
                            onChange={(event) => { onUpdateSlot({ ...slot, dj_name: event.target.value }) }}
                        /> */}
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column="sm" xs={12} md={2} className="text-md-end">
                        <strong>Type</strong>
                    </Form.Label>
                    <Col sx={12} md={10}>
                        <InputGroup>
                            <ToggleButton
                                id={`slot-${index}-live`}
                                key={`slot-${index}-live`}
                                type="radio"
                                variant="outline-dark"
                                size="sm"
                                name={`slot-${index}-slotType`}
                                value={SlotType.LIVE}
                                checked={slot.slot_type === SlotType.LIVE}
                                onChange={() => onUpdateSlot({ ...slot, slot_type: SlotType.LIVE })}
                            >
                                Live
                            </ToggleButton>
                            <ToggleButton
                                id={`slot-${index}-prerecord`}
                                key={`slot-${index}-prerecord`}
                                type="radio"
                                variant="outline-dark"
                                size="sm"
                                name={`slot-${index}-slotType`}
                                value={SlotType.PRERECORD}
                                checked={slot.slot_type === SlotType.PRERECORD}
                                onChange={() => onUpdateSlot({ ...slot, slot_type: SlotType.PRERECORD })}
                            >
                                Prerecord
                            </ToggleButton>

                            <Form.Select
                                size="sm"
                                value={slot.duration}
                                defaultValue={1}
                                onChange={(event) => { onUpdateSlot({ ...slot, duration: parseFloat(event.target.value) as SlotDuration }) }}
                            >
                                <option value={0}>None</option>
                                <option value={0.5}>Half Hour</option>
                                <option value={1}>1 Hour</option>
                                <option value={1.5}>1.5 Hours</option>
                                <option value={2}>2 Hours</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                </Form.Group>
                {/* <Form.Group as={Row}>
                    <Form.Label column="sm" sm={4} className="text-md-end">Is Debutt?</Form.Label>
                    <Col sm={8}>
                        <Form.Check
                            type="switch"
                            checked={slot.is_debut}
                            onChange={(event) => { onUpdateSlot({ ...slot, is_debut: event.target.checked }) }}
                        />
                    </Col>
                </Form.Group> */}
            </Col>
        </Row>
    </Container>;
}

export default SortableDj;