import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Box, Button, Form, Heading, Message, Section } from "react-bulma-components";
import { Event, getDiscordMessage } from "../util/types";

type Props = {
    event: Event
};

const EventDetails = ({ event }: Props) => {

    const eventMessage = getDiscordMessage(event);

    return <Section>
        <Box>
            <Heading>Discord Message</Heading>
            <Block>
                <Form.Textarea value={eventMessage} rows={16} readOnly className="has-fixed-size" />
            </Block>
            <Button fullwidth color={"primary"}>Copy Text</Button>
            <Message color="warning" size="small" className="p-3 m-2">Still need to implement a little toast message when ya copy, sorry, just trying to get this out the door :x</Message>
        </Box>
    </Section>
};

export default EventDetails;
