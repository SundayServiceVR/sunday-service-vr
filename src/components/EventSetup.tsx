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
        <Heading>Event Setup</Heading>
        <Block>
            <Form.Field>
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
            </Form.Field>
            <Form.Field>
                <Form.Label>
                    Date/Time (Local)
                </Form.Label>
                <Form.Control>
                    <DatePicker
                        showTimeSelect
                        value={djEvent.start_datetime.toLocaleString()}
                        onChange={(date:Date) => { 
                            setEvent({...djEvent, start_datetime: date})
                        }}
                        className="input" />
                </Form.Control>
            </Form.Field>
            <Form.Field>
                <Form.Label>
                    Message
                </Form.Label>
                <Form.Control>
                    <Form.Textarea
                        value={djEvent.message}
                        onChange={(event) => { 
                            setEvent({...djEvent, message: event.target.value})
                        }}/>
                </Form.Control>
            </Form.Field>
        </Block>

        {/* <h2>
            {event.start_datetime.toLocaleDateString()}
            -
            {event.start_datetime.toLocaleTimeString()} ({event.start_datetime.getTimezoneOffset()}) ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </h2> */}

        < hr />

        <Block>
            <EventFormSlotList
                slots={djEvent.slots}
                onSlotsChange={(slots: Slot[]) => {
                    setEvent({
                        ...djEvent,
                        slots
                    })
            }}/>
        </Block>
        
    </Section>
};

export default EventForm;
