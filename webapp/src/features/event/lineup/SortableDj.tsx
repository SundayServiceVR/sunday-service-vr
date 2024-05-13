import { Stack, Button, Form } from "react-bootstrap";
import { Dj, Slot, SlotDuration } from "../../../util/types";

type SortableDjProps = {
    dj: Dj,
    index: number,
    slot: Slot,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onSetSlotLength: (duration: SlotDuration) => void,
    onRemoveSlot: () => void,
    onToggleDebutt: () => void,
}

const SortableDj = ({
    dj,
    slot,
    onSlotMoveSooner,
    onSlotMoveLater,
    onSetSlotLength,
    onRemoveSlot,
    onToggleDebutt
}: SortableDjProps) =>
    <Stack className="my-2" direction="horizontal">
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

        <span className="mx-3">
            {slot.startTime?.toLocaleTimeString()}
        </span>
        <span className="lead mx-3">
            {dj.name}
        </span>
        <span className="mx-auto" />
        <span className="mx-2">
            <Form.Check 
                className="mt-2" 
                type="checkbox" 
                label="Debutt?" 
                checked={slot.isDebutt} 
                onChange={onToggleDebutt}
            /> 
        </span>
        <span className="mx-1">
            <Form.Group>
                <Form.Control
                    type={"number"}
                    step={0.5}
                    value={slot.duration}
                    onChange={(event) => { onSetSlotLength(parseFloat(event.target.value) as SlotDuration) }}
                    min={0}
                    max={4}
                />
            </Form.Group>
        </span>
        <span className="mx-1">
            <Button onClick={() => { onRemoveSlot(); }} variant="outline-danger">x</Button>
        </span>
    </Stack>;

export default SortableDj;