import React from "react";
import { Container, Form } from "react-bootstrap";

import { useEventSignupOutletMembers } from "../outletContext";
import { getHourOptionFromAvailability } from "../utils";
import { Timestamp } from "firebase/firestore";
import { EventSignupFormData } from "../../../util/types";

interface Step2Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
}

const StepAvailability: React.FC<Step2Props> = ({ formData, onChange }) => (
  <>
    <h5>When is your availability?</h5>
    <aside className="text-muted">
      <p>
        All times are based off of your browser's timezeone.<br />
        Please note that the event times are not necessarily the one's displayed here and are based on the host's availability.
      </p>
    </aside>
    <Container className="my-4">
      <Form.Group className="mb-3" controlId="available_from">
        <Form.Label>I am Available Starting</Form.Label>
        <Form.Select
          name="available_from"
          value={getHourOptionFromAvailability(formData.available_from)}
          onChange={onChange}
          defaultValue={""}
          required
        >
          <option disabled value="" />
          <option key={"any"} value={"any"}>
            Any Time
          </option>
          <HourOptions/>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3" controlId="available_to">
        <Form.Label>I am Available Up To</Form.Label>
        <Form.Select
          name="available_to"
          value={getHourOptionFromAvailability(formData.available_to)}
          defaultValue={""}
          onChange={onChange}
          required
        >
          <option disabled value="" />
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
    for (let i = 0; i <= 8; i++) {
      const optionDate = new Date(start.getTime() + i * 60 * 60 * 1000);
      const value = Timestamp.fromDate(optionDate).toDate().toISOString();
      const label = optionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      options.push(
        <option key={value} value={value}>
          {label}
        </option>
      );
    }
    return <>{options}</>;
  }

export default StepAvailability;
