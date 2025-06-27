import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData } from "../../../util/types";


interface Step3Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const EventSignupStep3: React.FC<Step3Props> = ({ formData, onChange }) => (
  <>
    <h5>Stream Details</h5>
    <Container className="mt-3">

      <Form.Group className="mb-3" controlId="type">
        <Form.Label>Live or Prerecord</Form.Label>
        <Form.Select name="type" value={formData.type || ""} onChange={onChange} required>
          <option value="" disabled />
          <option value="LIVE">Live</option>
          <option value="PRERECORD" disabled>Prerecord</option>
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

export default EventSignupStep3;
