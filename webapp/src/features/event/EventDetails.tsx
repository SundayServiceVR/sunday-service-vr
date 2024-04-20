import React from "react";
import { Form, Button, Stack } from "react-bootstrap";
import { Slot } from "../../util/types";
import EventFormSlotList from "./EventFormSlotList";
import { resetEvent } from "../../store/events";
import { useEventOperations } from "./EventRoot";
import "react-datepicker/dist/react-datepicker.css";

const EventDetails = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    return <div>
        <Stack direction="horizontal" gap={3}>
            <h2 className="display-6">Event Setup</h2>
            <span className="ms-auto" />
            <Button
                placeholder="Sunday Service"
                value={eventScratchpad.name}
                // TODO: Make a confirmation dialog component
                onClick={(_: any) => { if (window.confirm("Reset the event?  (Date will be updated to next sunday)")) { resetEvent(); } }}
                variant={"outline-danger"}
            >Reset Event</Button>
        </Stack>
        <Form>
            <Form.Group>
                <Form.Label>
                    Event Name
                </Form.Label>
                <Form.Control
                    placeholder="Sunday Service"
                    type="text"
                    value={eventScratchpad.name}
                    onChange={(event) => { proposeEventChange({ ...eventScratchpad, name: event.target.value }); }}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Date/Time (Local)
                </Form.Label>
                <Form.Control
                    type="datetime-local"
                    value={new Date(eventScratchpad.start_datetime.getTime() - eventScratchpad.start_datetime.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)}
                    onChange={(event) => {
                        proposeEventChange({ ...eventScratchpad, start_datetime: new Date(event.target.value) })
                    }}
                    className="input" />

            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Discord Message
                </Form.Label>

                <Form.Control
                    type="textarea"
                    value={eventScratchpad.message}
                    onChange={(event) => {
                        proposeEventChange({ ...eventScratchpad, message: event.target.value })
                    }} />
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Host
                </Form.Label>
                <Form.Control
                    placeholder="Strawbs"
                    type="text"
                    value={eventScratchpad.host}
                    onChange={(event) => { proposeEventChange({ ...eventScratchpad, host: event.target.value }); }}
                />
            </Form.Group>
        </Form>
        < hr />
        <EventFormSlotList
            slots={eventScratchpad.slots}
            onSlotsChange={(slots: Slot[]) => {
                proposeEventChange({
                    ...eventScratchpad,
                    slots
                })
            }} />
    </div>
};

export default EventDetails;
