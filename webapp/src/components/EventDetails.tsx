import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Box, Button, Form, Heading, Message, Section } from "react-bulma-components";
import { Event, Slot } from "../util/types";

type Props = {
    event: Event
};

const getDiscordMessage = (event: Event): string => {
    return `${event.name}
${event.message}
${dateToDiscordTime(event.start_datetime)}

DJs:
${event.slots.map(getSlotText).join("\n")}`;
}

const getSlotText = (slot: Slot) => {
    let slotText = `${slot.startTime ? dateToDiscordTime(slot.startTime) : ""} : ${slot.dj.name}`;
    if(slot.dj.twitch_url) {
        slotText = `${slotText} - ${slot.dj.twitch_url}`
    }
    return slotText;
}



const dateToDiscordTime = (date: Date): string => {
    // Example: <t:1656270000:R>
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}

const EventDetails = ({ event }: Props) => {

    const eventMessage = getDiscordMessage(event);

    return <Section>
        <Box>
            <Heading>Discord Message</Heading>
            <Block>
                <Form.Textarea value={eventMessage} rows={16} readOnly className="has-fixed-size" />
            </Block>
            <Button fullwidth color={"primary"} onClick={() => { navigator.clipboard.writeText(eventMessage); }}>Copy Text</Button>
            <Message color="warning" size="small" className="p-3 m-2">Still need to implement a little toast message when ya copy, sorry, just trying to get this out the door :x</Message>
        </Box>
    </Section>
};

export default EventDetails;
