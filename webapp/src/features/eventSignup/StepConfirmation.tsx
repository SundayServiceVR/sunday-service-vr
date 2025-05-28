import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData } from "./types";

interface Step3Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const EventSignupStep3: React.FC<Step3Props> = ({ formData, onChange }) => (
  <>
    <h5>Extra Info</h5>
    <Container className="mt-3 mb-4">
      <Form.Group className="mb-3" controlId="otherInfo">
        <Form.Label>Is there anything else you want us to know?</Form.Label>
        <Form.Control
          type="textarea"
          name="otherInfo"
          placeholder="The floor is yours!"
          value={formData.otherInfo || ""}
          onChange={onChange}
        />
      </Form.Group>
    </Container>
    <h5>Know What's Expected of You</h5>
    <Container className="mt-3 mb-">
      <Form.Group controlId="confirmExpectations">
        <Form.Check
          type="checkbox"
          name="confirmExpectations"
          label="I have read and understand the expectations of a performer."
          checked={!!formData.confirmExpectations}
          onChange={onChange}
          required
        />
      </Form.Group>
    </Container>

  </>
);

export default EventSignupStep3;
