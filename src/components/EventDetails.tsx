import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Box, Content, Heading, Section } from "react-bulma-components";
import { Event, Slot } from "../types/types";

type Props = {
    event: Event,
}

const EventDetails = ({event}: Props) => {
    return <Section>
        <Heading>
            {event.name}
        </Heading>
        <Content>
            <h2>
                {event.start_datetime.toLocaleDateString()}
                -
                {event.start_datetime.toLocaleTimeString()} ({event.start_datetime.getTimezoneOffset()}) ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </h2>
            <Box>
            <ul>
                {event.slots.map(
                    (slot: Slot) => <li key={`slot-${slot.dj.name}`}>{slot.dj.name}</li>
                )}
            </ul>
            </Box>
        </Content>
    </Section>
};

export default EventDetails;