import React from "react";
import { Form } from "react-bootstrap";
import { Event } from "../../util/types";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    event: Event,
    onEventChange: (event: Event) => void,
}

const EventSetupBasicDetails = ({ event, onEventChange }: Props) => {

    return <>
        <Form.Group>
            <Form.Label aria-required="true">
                Event Name
            </Form.Label>
            <Form.Control
                placeholder="Sunday Service"
                type="text"
                value={event.name}
                required
                onChange={(formEvent) => { onEventChange(({ ...event, name: formEvent.target.value })); }}
            />
        </Form.Group>
        <Form.Group className="mt-2">
            <Form.Label>
                Date/Time (Local)
            </Form.Label>
            <Form.Control
                type="datetime-local"
                value={new Date(event.start_datetime.getTime() - event.start_datetime.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)}
                required
                onChange={(formEvent) => {
                    onEventChange({ ...event, start_datetime: new Date(formEvent.target.value) })
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
                value={event.host}
                required
                onChange={(formEvent) => { onEventChange({ ...event, host: formEvent.target.value }); }}
            />
        </Form.Group>
    </>

};

export default EventSetupBasicDetails;
