import React from "react";
import { Container, Form, Button, Stack } from "react-bootstrap";
import { Event, Slot } from "../util/types";
import EventFormSlotList from "./EventFormSlotList";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

type Props = {
    djEvent: Event,
    setEvent: (event: Event) => void,
    resetEvent: () => void,
};

const EventForm = ({ djEvent, setEvent, resetEvent }: Props) => {
    return <div>
        <Stack direction="horizontal" gap={3}>
            <h2 className="display-3">Event Setup</h2>
            <span className="ms-auto" />
            <Button
                placeholder="Sunday Service"
                value={djEvent.name}
                // TODO: Make a confirmation dialog component
                onClick={(_: any) => { if (window.confirm("Reset the event?  (Date will be updated to next sunday)")) { resetEvent(); } }}
                color={"danger"}
            >Reset</Button>
        </Stack>
        <div>
            <Form>
                <Form.Group>
                    <Form.Label>
                        Event Name
                    </Form.Label>
                    <Form.Control
                        placeholder="Sunday Service"
                        type="text"
                        value={djEvent.name}
                        onChange={(event) => { setEvent({ ...djEvent, name: event.target.value }); }}
                    />
                </Form.Group>
                <Form.Group>
                <Form.Label>
                    Date/Time (Local)
                </Form.Label>
           
                    <Form.Control
                        type="datetime-local"
                        value={djEvent.start_datetime.toISOString().slice(0,16)}
                        onChange={(event) => {
                            // debugger;
                            setEvent({ ...djEvent, start_datetime: new Date(event.target.value)})
                        }}
                        className="input" />
        
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Message
                </Form.Label>
             
                <Form.Control
                    type="textarea"
                    value={djEvent.message}
                    onChange={(event) => {
                        setEvent({ ...djEvent, message: event.target.value })
                    }} />
            </Form.Group>
            </Form>
        </div>
        < hr />
        <div>
            <EventFormSlotList
                slots={djEvent.slots}
                onSlotsChange={(slots: Slot[]) => {
                    setEvent({
                        ...djEvent,
                        slots
                    })
                }} />
        </div> 
    </div>
};

export default EventForm;