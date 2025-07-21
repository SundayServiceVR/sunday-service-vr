import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData, Event } from "../../../util/types";


interface Step3Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
  event?: Event;
}

const EventSignupStep3: React.FC<Step3Props> = ({ formData, onChange, event }) => {
  const isLiveJive = event?.signup_configuration?.isLiveJive || false;
  
  // If this is a livejive event and the user previously selected PRERECORD, 
  // we need to clear that selection
  React.useEffect(() => {
    if (isLiveJive && formData.type === "PRERECORD") {
      // Create a synthetic event to clear the prerecord selection
      const syntheticEvent = {
        target: {
          name: "type",
          value: "",
          type: "select-one"
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  }, [isLiveJive, formData.type, onChange]);
  
  return (
    <>
      <h5>Stream Details</h5>
      {isLiveJive && (
        <div className="alert alert-info">
          <strong>Live Jive Event:</strong> This is a Live Jive event - only live performances are allowed!
        </div>
      )}
      <Container className="mt-3">

        <Form.Group className="mb-3" controlId="type">
          <Form.Label>Live or Prerecord</Form.Label>
          <Form.Select name="type" value={formData.type || ""} onChange={onChange} required>
            <option value=""/>
            <option value="LIVE">Live</option>
            {!isLiveJive && <option value="PRERECORD">Prerecord</option>}
          </Form.Select>
        </Form.Group>
        { formData.type === "LIVE" && (
          <Form.Group className="mb-3" controlId="stream_link">
            <Form.Label>Stream Link</Form.Label>
            <Form.Control
              type="url"
              name="stream_link"
              placeholder="Enter your stream link"
              value={formData.stream_link || ""}
              onChange={onChange}
              required
          />
        </Form.Group>
      )}
      </Container>
    </>
  );
};

export default EventSignupStep3;
