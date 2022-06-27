import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Box, Heading, Section } from "react-bulma-components";
import { Dj, Event, Slot } from "../util/types";
import SlotList from "./EventFormSlotList";
import { RESIDENT_DJS } from "../util/constants";

type Props = {
    event: Event,
    setEvent: (event: Event)=>void
};

const EventDetails = ({event, setEvent}: Props) => {
    return <Block>
        <Heading>
            {event.name}
        </Heading>
        <h2>
            {event.start_datetime.toLocaleDateString()}
            -
            {event.start_datetime.toLocaleTimeString()} ({event.start_datetime.getTimezoneOffset()}) ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </h2>

       <ol>
        {event.slots.map((slot: Slot) => <li key={`dj-slot-${slot.dj.name}`}>{slot.dj.name}</li>)}
       </ol>
    </Block>
};

export default EventDetails;
