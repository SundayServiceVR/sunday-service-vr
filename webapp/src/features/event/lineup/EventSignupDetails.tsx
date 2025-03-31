import { Col, Container, Form, InputGroup, Row, ToggleButton } from "react-bootstrap"
import { SlotType, SlotDuration, EventSignup } from "../../../util/types"

type Props = {
  signup: EventSignup,
  onUpdateSignup: (signup: EventSignup) => void,
}

const EventSlotDetails = ({signup, onUpdateSignup }: Props) => {
  return <Container>
    <Form.Group as={Row} className="mb-1">
      <Form.Label column="sm" sm={3} className="text-md-end">
        <strong>Event Specific Name</strong>
      </Form.Label>
      <Col>
        <Form.Control
              size="sm"
              value={signup.name}
              defaultValue={1}
              onChange={(event) => { onUpdateSignup({ ...signup, name: event.target.value }) }}
                        />
      </Col>
    </Form.Group>
    <Form.Group as={Row}>
      <Form.Label column="sm" xs={12} md={3} className="text-md-end">
        <strong>Type</strong>
      </Form.Label>
      <Col>
        <InputGroup>
          <ToggleButton
            id={`slot-${signup.uuid}-live`}
            key={`slot-${signup.uuid}-live`}
            type="radio"
            variant="outline-dark"
            size="sm"
            name={`slot-${signup.uuid}-slotType`}
            value={SlotType.LIVE}
            checked={signup.type === SlotType.LIVE}
            onChange={() => onUpdateSignup({ ...signup, type: SlotType.LIVE })}
          >
            Live
          </ToggleButton>
          <ToggleButton
            id={`slot-${signup.uuid}-prerecord`}
            key={`slot-${signup.uuid}-prerecord`}
            type="radio"
            variant="outline-dark"
            size="sm"
            name={`slot-${signup.uuid}-slotType`}
            value={SlotType.PRERECORD}
            checked={signup.type === SlotType.PRERECORD}
            onChange={() => onUpdateSignup({ ...signup, type: SlotType.PRERECORD })}
          >
            Prerecord
          </ToggleButton>

          <Form.Select
            size="sm"
            value={signup.requested_duration}
            defaultValue={1}
            onChange={(event) => { onUpdateSignup({ ...signup, requested_duration: parseFloat(event.target.value) as SlotDuration }) }}
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
    <Form.Group as={Row}>
      <Form.Label column="sm" xs={12} md={3} className="text-md-end">
        <strong>Debutt</strong>
      </Form.Label>
      <Col className="d-flex align-items-center">
        <Form.Check
          type="switch"
          checked={signup.debut}
          onChange={(debutChangeEvent) => { onUpdateSignup({ ...signup, debut: debutChangeEvent.target.checked }) }}
        />
      </Col>
    </Form.Group>
  </Container>
}

export default EventSlotDetails;