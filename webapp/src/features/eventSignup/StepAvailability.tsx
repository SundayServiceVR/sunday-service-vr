import React from "react";
import { Container, Form } from "react-bootstrap";
import { EventSignupFormData } from "./types";
import { useEventSignupOutletMembers } from "./outletContext";

interface Step2Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const StepAvailability: React.FC<Step2Props> = ({ formData, onChange }) => (
  <>
    <h5>When is your availability?</h5>
    <Container className="mt-3">
      <Form.Group className="mb-3" controlId="availableFrom">
        <Form.Label>I am Available Starting</Form.Label>
        <Form.Select
          name="availableFrom"
          value={formData.availableFrom || ""}
          onChange={onChange}
          required
        >
          <option disabled selected value="" />
          <option key={"any"} value={"any"}>
            Any Time
          </option>
          <HourOptions/>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3" controlId="availableTo">
        <Form.Label>I am Available Up To</Form.Label>
        <Form.Select
          name="availableTo"
          value={formData.availableTo || ""}
          onChange={onChange}
          required
        >
          <option disabled selected value="" />
          <option key={"any"} value={"any"}>
            Any Time
          </option>
          <HourOptions/>
        </Form.Select>
      </Form.Group>
    </Container>
  </>


);

 function HourOptions() {
    // You may need to adjust the import path for useEventSignupOutletMembers
    // and the event object shape if different
    // eslint-disable-next-line
    // @ts-ignore
    const { event } = useEventSignupOutletMembers();
    if (!event?.start_datetime) return null;

    const start = new Date(event.start_datetime);
    const options = [];
    for (let i = 0; i <= 10; i++) {
      const optionDate = new Date(start.getTime() + i * 60 * 60 * 1000);
      const value = optionDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
      const label = optionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      options.push(
        <option key={value} value={value}>
          {label}
        </option>
      );
    }
    return <>{options}</>;
  }

export default StepAvailability;
