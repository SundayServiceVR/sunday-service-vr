import React from "react";
import "../../node_modules/bulma/css/bulma.min.css";
import { Block, Form, Heading, Section } from "react-bulma-components";
import { Event, getDiscordMessage } from "../util/types";

type Props = {
    event: Event
};

const EventDetails = ({ event }: Props) => {

    const eventMessage = getDiscordMessage(event);

    return <Section>
        <Heading>Output Message</Heading>
        <Block>
            <Form.Textarea value={eventMessage} rows={eventMessage.split("\n").length} readOnly className="has-fixed-size" />
        </Block>
    </Section>
};

export default EventDetails;
