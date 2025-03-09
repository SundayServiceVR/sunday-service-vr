import { Stack, Button, Container, Row, Col,} from "react-bootstrap";
import { Slot, Event, EventSignup } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import { ArrowDown, ArrowUp } from "react-feather";
import SignupDetails from "./SignupDetails";


type Props = {
    index: number,
    slot: Slot,
    signup: EventSignup,
    event: Event,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onRemoveSlot: () => void,
    onUpdateSlot: (newSlot: Slot) => void,
    onUpdateSignup: (newSignup: EventSignup) => void,
}

const LineupEventSlot = ({
    onUpdateSignup,
    slot,
    signup,
    onSlotMoveSooner,
    onSlotMoveLater,
    onRemoveSlot,
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
                <SignupDetails signup={signup} onUpdateSignup={onUpdateSignup}/>
            </Col>
        </Row>
    </Container>;
}

export default LineupEventSlot;