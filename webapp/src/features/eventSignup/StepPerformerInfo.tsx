import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData } from "../../util/types";

interface Step1Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const StepPerformerInfo: React.FC<Step1Props> = ({ formData, onChange }) => {
  return <>
    <h5>Performance Details</h5>
    <Container className="mt-3">
      <Form.Group className="mb-3" controlId="isB2B">
        <Form.Label>Is this set a Back-to-Back?</Form.Label>
        <Form.Select name="isB2B" value={formData.is_b2b || "No"} onChange={onChange} required>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
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
      {formData.is_b2b === "Yes" && (
        <Form.Group className="mb-3" controlId="b2bMembers">
          <Form.Label>Who else is included in the set?</Form.Label>
          <Form.Control
            type="text"
            name="b2bMembers"
            placeholder="Enter other members"
            value={formData.b2b_members_response || ""}
            onChange={onChange}
            disabled={formData.is_b2b !== "Yes"}
            required
          />
        </Form.Group>
      )}
      <Form.Group className="mb-3" controlId="requested_duration">
        <Form.Label>How long will your performance be?</Form.Label>
        <Form.Select name="requested_duration" value={formData.requested_duration || ""} onChange={onChange} required>
          <option value="" disabled>Select duration</option>
          <option value={1}>One Hour</option>
          <option value={0.5}>Half Hour</option>
        </Form.Select>
      </Form.Group>
    </Container>
  </>
};

export default StepPerformerInfo;
