import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData } from "../../../util/types";

interface Step1Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const StepPerformerInfo: React.FC<Step1Props> = ({ formData, onChange }) => {
  return <>
    <h5>Performance Details</h5>
    <Container className="mt-3">
      <Form.Group className="mb-3" controlId="is_b2b">
        <Form.Label>Is this set a Back-to-Back?</Form.Label>
        <Form.Select name="is_b2b" value={formData.is_b2b === true ? 1 : 0} onChange={onChange} required>
          <option value={1}>Yes</option>
          <option value={0}>No</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="name">
        <Form.Label>What is your {formData.is_b2b ? "Back to Back" : "Dj"} name?</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="Enter the name as it should appear on the lineup"
          value={formData.name}
          onChange={onChange}
          required
        />
      </Form.Group>
      {formData.is_b2b === true && (
        <Form.Group className="mb-3" controlId="b2b_members_response">
          <Form.Label>Who else is included in the set?</Form.Label>
          <Form.Control
            type="text"
            name="b2b_members_response"
            placeholder="Enter other members"
            value={formData.b2b_members_response || ""}
            onChange={onChange}
            required
          />
        </Form.Group>
      )}
      <Form.Group className="mb-3" controlId="requested_duration">
        <Form.Label>How long will your performance be {formData.requested_duration}?</Form.Label>
        <Form.Select name="requested_duration" value={formData.requested_duration?.toString() || ""} onChange={onChange} required>
          <option value="" disabled>Select duration</option>
          <option value={"1"}>One Hour</option>
          <option value={"0.5"}>Half Hour</option>
        </Form.Select>
      </Form.Group>
    </Container>
  </>
};

export default StepPerformerInfo;
