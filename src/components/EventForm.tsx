import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Box, Heading, Section, Form} from "react-bulma-components";
import { Event, Slot } from "../util/types";
import EventFormSlotList from "./EventFormSlotList";

type Props = {
    event: Event,
    setEvent: (event: Event)=>void
};

const EventForm = ({event, setEvent}: Props) => {
    return <Block>
        <Form.Label>
            Event Name
        </Form.Label>
        <Form.Control>
        <Form.Input
            placeholder="Sunday Service"
            type="text"
        />
        </Form.Control>
        <h2>
            {event.start_datetime.toLocaleDateString()}
            -
            {event.start_datetime.toLocaleTimeString()} ({event.start_datetime.getTimezoneOffset()}) ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </h2>

        <Section>
            <h2>Slots</h2>
        <EventFormSlotList
            slots={event.slots}
            onSlotsChange={(slots: Slot[]) => {
                setEvent({
                    ...event,
                    slots
                })
        }}/>
        </Section>
        
    </Block>
};

export default EventForm;
