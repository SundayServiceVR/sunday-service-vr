import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Section, Form, Heading} from "react-bulma-components";
import { Event, Slot } from "../util/types";
import EventFormSlotList from "./EventFormSlotList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    djEvent: Event,
    setEvent: (event: Event)=>void
};

const EventForm = ({djEvent, setEvent}: Props) => {
    return <Section>
        <Heading>Event Details</Heading>
        <Form.Label>
            Event Name
        </Form.Label>
        <Form.Control>
            <Form.Input
                placeholder="Sunday Service"
                type="text"
                value={djEvent.name}
                onChange={(event) => {setEvent({...djEvent, name: event.target.value});}}
            />
        </Form.Control>

        <Form.Label>
            Date
        </Form.Label>
        <Form.Control>
            <DatePicker
                showTimeSelect
                value={djEvent.start_datetime.toString()}
                onChange={(date:Date) => { 
                    //setEvent({...djEvent, start_datetime: date})
                }}
                className="input" />
        </Form.Control>

        {/* <Form.Label>
            Time
        </Form.Label>
        <Form.Control>
            <Form.Input
                value={`13:00}`}
                type="time"
            />
        </Form.Control> */}

        {/* <h2>
            {event.start_datetime.toLocaleDateString()}
            -
            {event.start_datetime.toLocaleTimeString()} ({event.start_datetime.getTimezoneOffset()}) ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </h2> */}

        <Section>
            <h2>Slots</h2>
        <EventFormSlotList
            slots={djEvent.slots}
            onSlotsChange={(slots: Slot[]) => {
                setEvent({
                    ...djEvent,
                    slots
                })
        }}/>
        </Section>
        
    </Section>
};

export default EventForm;
