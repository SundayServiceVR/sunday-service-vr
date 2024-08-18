import { Stack, Button, Form, Container, Row, Col, ButtonGroup, ToggleButton, InputGroup, ListGroup } from "react-bootstrap";
import { Dj, Slot, SlotDuration, SlotType } from "../../../util/types";
import { useRef, useState } from "react";
import { SelectDjModal } from "../../dj/SelectDjModal";
import { DocumentReference } from "firebase/firestore";

type Props = {
    index: number,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onRemoveSlot: () => void,
    onUpdateSlot: (newSlot: Slot) => void,
}

type DjCreatedCallback = React.ComponentProps<typeof SelectDjModal>["onDjSelected"];

const EventSlot = ({
    index,
    slot,
    onSlotMoveSooner,
    onSlotMoveLater,
    onRemoveSlot,
    onUpdateSlot,
}: Props) => {

    const [showAddDjModal, setShowAddDjModal] = useState<boolean>(false);
    const onDjSelected = useRef<DjCreatedCallback>(() => { });

    const onAddDjFactory = (onAddDj: DjCreatedCallback) => (/*html event unused*/) => {
        // setOnDjSelected(onAddDj); // Set the callback. 
        onDjSelected.current = onAddDj;
        setShowAddDjModal(true); // Show the modal
    }

    const addDj = (name: string, ref: DocumentReference) => {
        onUpdateSlot({
            ...slot,
            djs: [
                ...slot.djs,
                {
                    name,
                    ref
                }
            ],
        })
    }

    const removeDj = (djRef: DocumentReference) => { onUpdateSlot({ ...slot, djs: slot.djs.filter(existingDjs => existingDjs.ref !== djRef) }) };

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
                            <span className="lead">{slot.name}</span>
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
            <Col sm={12} md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }}>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={4}>Slot Name</Form.Label>
                    <Col>
                        <Form.Control
                            value={slot.name}
                            onChange={(inputEvent) => { onUpdateSlot({ ...slot, name: inputEvent.target.value }) }}
                            min={0}
                            max={4}
                        />
                    </Col>
                    <Form.Label column sm={4}>Slot Length (In Hours)</Form.Label>
                    <Col>
                        <Form.Control
                            type={"number"}
                            step={0.5}
                            value={slot.duration}
                            onChange={(event) => { onUpdateSlot({ ...slot, duration: parseFloat(event.target.value) as SlotDuration }) }}
                            min={0}
                            max={4}
                        />
                    </Col>
                </Form.Group>
            </Col>
        </Row>
        <Row>
            <Col sm={12} md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }}>
                <Form.Label column sm={4}>DJs</Form.Label>
                <ListGroup>
                    {
                        slot.djs?.map(slotDj =>
                            <ListGroup.Item>
                                {slotDj.name}
                                <Button
                                    className="float-end"
                                    variant="outline-danger"
                                    onClick={() => removeDj(slotDj.ref)}
                                >X</Button>
                            </ListGroup.Item>
                        )
                    }
                    <Button 
                        variant="outline-primary"
                        onClick={
                            onAddDjFactory(
                                (addedDj: Dj, ref: DocumentReference) => {
                                    addDj(addedDj.dj_name, ref);
                                    setShowAddDjModal(false);
                                })
                        }>
                            Add B2B Dj
                        </Button>
                </ListGroup>
            </Col>
        </Row>

        <Row>
            <Col>
                <Form.Group as={Row} className="mb-3">
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
                            onChange={() => onUpdateSlot({ ...slot, slot_type: SlotType.RTMP })}
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
                            onChange={() => onUpdateSlot({ ...slot, slot_type: SlotType.TWITCH })}
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
                            onChange={() => onUpdateSlot({ ...slot, slot_type: SlotType.PRERECORD })}
                        >
                            PreRecord
                        </ToggleButton>
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
        <SelectDjModal show={showAddDjModal} onDjSelected={onDjSelected.current} handleClose={() => { setShowAddDjModal(false); }} />
    </Container >;
}

export default EventSlot;
