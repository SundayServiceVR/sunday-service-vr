import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData } from "../../../util/types";

interface Step3Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const EventSignupStep3: React.FC<Step3Props> = ({ formData, onChange }) => (
  <>
    <h5>Know What's Expected of You</h5>
    <blockquote className="blockquote m-5">
      <ul>
      <li>
          Remember that we are not a club, we're a community! We are here to have fun, and we expect you to be respectful of others.
        </li>
        <li>
          Communication with the host(s) is a prerequisite to play. Make sure you are able to receive messages from the host(s) via Discord.
        </li>
        <li>
          If selected, you will need to confirm your slot in Discord. This is important to ensure that the host(s) know you are still available to perform.
        </li>
      </ul>
    </blockquote>
    <Container className="mt-3 d-flex justify-content-center">
      <Form.Group controlId="confirm_expectations" className="text-center">
      <Form.Check
        type="checkbox"
        name="confirm_expectations"
        label="I Understand the expectations of a performer."
        checked={!!formData.confirm_expectations}
        onChange={onChange}
        required
        style={{ transform: "scale(1.2)" }}
      />
      </Form.Group>
    </Container>
    <h5>Extra Info</h5>
    <Container className="mt-3 mb-4">
      <Form.Group className="mb-3" controlId="dj_notes">
        <Form.Label>Is there anything else you want us to know?</Form.Label>
        <Form.Control
          type="textarea"
          name="dj_notes"
          placeholder="The floor is yours!"
          value={formData.dj_notes || ""}
          onChange={onChange}
        />
      </Form.Group>
    </Container>
  </>
);

export default EventSignupStep3;
