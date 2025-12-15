import React from "react";
import { Col, Container, Form, InputGroup, Row, ToggleButton, Button } from "react-bootstrap"
import toast from "react-hot-toast";
import { SlotType, SlotDuration, EventSignup, EventSignupFormData } from "../../../util/types"

/**
 * Normalizes stream links for display in the lineup.
 * Converts shorthand formats to full URLs.
 */
const normalizeStreamLink = (link: string | undefined): { normalized: string; isReadOnly: boolean } => {
  if (!link) return { normalized: '', isReadOnly: false };

  // Check for vrcdn: prefix
  if (link.startsWith('vrcdn:')) {
    const username = link.substring(6); // Remove 'vrcdn:' prefix
    return {
      normalized: `rtmp://stream.vrcdn.live/live/${username}`,
      isReadOnly: true
    };
  }

  // Check for twitch: prefix
  if (link.startsWith('twitch:')) {
    const username = link.substring(7); // Remove 'twitch:' prefix
    return {
      normalized: `https://www.twitch.tv/${username}/embed?frameborder="0"`,
      isReadOnly: true
    };
  }

  // Return as-is if no special prefix
  return { normalized: link, isReadOnly: false };
};

type Props = {
  signup: EventSignup,
  onUpdateSignup: (signup: EventSignup) => void,
}

const EventSlotDetails = ({ signup, onUpdateSignup }: Props) => {
  const rawStreamLink = signup.event_signup_form_data?.stream_link;
  const { normalized, isReadOnly } = normalizeStreamLink(rawStreamLink);

  const handleStreamLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onUpdateSignup({
      ...signup,
      event_signup_form_data: {
        ...(signup.event_signup_form_data || {}),
        stream_link: newValue,
      } as EventSignupFormData,
    });
  };

  const handleCopyStreamLink = async () => {
    if (!normalized) return;

    try {
      await navigator.clipboard.writeText(normalized);
      toast("Stream link copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy stream link", error);
      toast("Failed to copy stream link.");
    }
  };

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
          checked={signup.is_debut}
          onChange={(debutChangeEvent) => { onUpdateSignup({ ...signup, is_debut: debutChangeEvent.target.checked }) }}
        />
      </Col>
    </Form.Group>
    {
      signup.event_signup_form_data &&
      <Form.Group as={Row}>
        <Form.Label column="sm" xs={12} md={3} className="text-md-end">
          <strong>Availability</strong>
        </Form.Label>
        <Col className="d-flex align-items-center">
          {availabilityTimeFormat(signup.event_signup_form_data?.available_from)}
          -
          {availabilityTimeFormat(signup.event_signup_form_data?.available_to)}
        </Col>
      </Form.Group>
    }

    {
      signup.event_signup_form_data?.dj_notes &&
      <Form.Group as={Row}>
        <Form.Label column="sm" xs={12} md={3} className="text-md-end">
          <strong>Dj Notes</strong>
        </Form.Label>
        <Col className="d-flex align-items-center">
          {signup.event_signup_form_data?.dj_notes}
        </Col>
      </Form.Group>
    }

    {signup.type !== SlotType.PRERECORD && (
      <>
        {isReadOnly && (
          <Form.Group as={Row} className="mb-1">
            <Form.Label column="sm" xs={12} md={3} className="text-md-end">
              <strong>Stream Link</strong>
            </Form.Label>
            <Col>
              <InputGroup size="sm">
                <Form.Control
                  size="sm"
                  value={normalized}
                  readOnly
                  style={{ fontFamily: 'monospace' }}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleCopyStreamLink}
                  disabled={!normalized}
                >
                  Copy
                </Button>
              </InputGroup>
            </Col>
          </Form.Group>
        )}

        <Form.Group as={Row}>
          <Form.Label column="sm" xs={12} md={3} className="text-md-end">
            <strong>{isReadOnly ? 'Raw Link' : 'Stream Link'}</strong>
          </Form.Label>
          <Col>
            <Form.Control
              size="sm"
              value={rawStreamLink ?? ''}
              placeholder="Enter stream link"
              onChange={handleStreamLinkChange}
            />
          </Col>
        </Form.Group>
      </>
    )}

    {
      signup.event_signup_form_data?.is_b2b &&
      <>
        <Form.Group as={Row}>
          <Form.Label column="sm" xs={12} md={3} className="text-md-end">
            <strong>B2B With</strong>
          </Form.Label>
          <Col className="d-flex align-items-center">
            {signup.event_signup_form_data?.b2b_members_response}
          </Col>
        </Form.Group>
      </>
    }

  </Container>
}

const availabilityTimeFormat = (time: EventSignupFormData["available_from"] | EventSignupFormData["available_to"]) => {
  if (!time) {
    return "Unknown";
  }

  if (time === "any") {
    return "Any Time";
  }


  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default EventSlotDetails;