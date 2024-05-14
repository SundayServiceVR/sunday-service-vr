import React from "react";
import { Form } from "react-bootstrap";
import { Event } from "../../../util/types";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    event: Event,
    onEventChange: (event: Event) => void,
}

const EventBasicDetailsForm = ({ event: eventScratchpad, onEventChange: proposeEventChange }: Props) => {
    return <>
        <Form>
        <Form.Group>
            <Form.Label aria-required="true">
                Event Name
            </Form.Label>
            <Form.Control
                placeholder="Sunday Service"
                type="text"
                value={eventScratchpad.name}
                required
                onChange={(formEvent) => { proposeEventChange(({ ...eventScratchpad, name: formEvent.target.value })); }}
            />
        </Form.Group>
        <Form.Group className="mt-2">
            <Form.Label>
                Date/Time (Local)
            </Form.Label>
            <Form.Control
                type="datetime-local"
                value={new Date(eventScratchpad.start_datetime.getTime() - eventScratchpad.start_datetime.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)}
                required
                onChange={(formEvent) => {
                    proposeEventChange({ ...eventScratchpad, start_datetime: new Date(formEvent.target.value) })
                }}
                className="input" />
        </Form.Group>
        <Form.Group className="mt-2">
            <Form.Label>
                Host
            </Form.Label>
            <Form.Control
                placeholder="Strawbs"
                type="text"
                value={eventScratchpad.host}
                required
                onChange={(formEvent) => { proposeEventChange({ ...eventScratchpad, host: formEvent.target.value }); }}
            />
        </Form.Group>
    </Form>
    </>

};

export default EventBasicDetailsForm;
