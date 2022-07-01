import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Box, Form, Heading, Section } from "react-bulma-components";
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
        </Box>
    </Section>
};

export default EventDetails;
