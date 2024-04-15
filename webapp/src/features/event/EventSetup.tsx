import React from "react";
import { Form, Button, Stack } from "react-bootstrap";
import { Event, Slot } from "../../util/types";
import EventFormSlotList from "./EventFormSlotList";

import "react-datepicker/dist/react-datepicker.css";

type Props = {
    djEvent: Event,
    setEvent: (event: Event) => void,
    resetEvent: () => void,
};

const EventForm = ({ djEvent, setEvent, resetEvent }: Props) => {
    return <div>
        <Stack direction="horizontal" gap={3}>
            <h2 className="display-6">Event Setup</h2>
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
                        value={new Date(djEvent.start_datetime.getTime() - djEvent.start_datetime.getTimezoneOffset()*60*1000).toISOString().slice(0, 16)}
                        onChange={(event) => {
                            debugger;
                            console.log(djEvent.start_datetime.toISOString().slice(0, 16))
                            setEvent({ ...djEvent, start_datetime: new Date(event.target.value)})
                        }}
                        className="input" />
        
                </Form.Group>
                <Form.Group>
                    <Form.Label>
                        Discord Message
                    </Form.Label>
                
                    <Form.Control
                        type="textarea"
                        value={djEvent.message}
                        onChange={(event) => {
                            setEvent({ ...djEvent, message: event.target.value })
                        }} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>
                        Host
                    </Form.Label>
                    <Form.Control
                        placeholder="Strawbs"
                        type="text"
                        value={djEvent.host}
                        onChange={(event) => { setEvent({ ...djEvent, host: event.target.value }); }}
                    />
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
