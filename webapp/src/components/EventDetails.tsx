import React from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Tabs, Tab } from "react-bootstrap";
import { Event, Slot } from "../util/types";


type Props = {
    event: Event
};

const getDiscordMessage = (event: Event): string => 
`${event.name}
${event.message}
${dateToDiscordTime(event.start_datetime)}

DJs:
${event.slots.map(getSlotText).join("\n")}
`;

const dateToDiscordTime = (date: Date): string => {
    // Example: <t:1656270000:R>
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}

const getSlotText = (slot: Slot) => {
    let slotText = `${slot.startTime ? dateToDiscordTime(slot.startTime) : ""} : ${slot.dj.name}`;
    if(slot.dj.twitch_url) {
        slotText = `${slotText} - ${slot.dj.twitch_url}`
    }
    return slotText;
}


const EventDetails = ({ event }: Props) => {

    const eventMessage = getDiscordMessage(event);

    return <Card>
            <CardHeader>Discord Message</CardHeader>
            <CardBody>
                <Tabs>
                    <Tab eventKey="discord" title="Discord">
                        Tab content for Discord
                    </Tab>
                    <Tab eventKey="twitter" title="Twitter">
                        Tab content for Twitter
                    </Tab>
                    <Tab eventKey="uk" title="UK Paste">
                        Tab content for UK
                    </Tab>
                    <Tab eventKey="au" title="AU Paste">
                        Tab content for AU
                    </Tab>
                </Tabs>
                <Form.Control as="textarea" value={eventMessage} rows={16} readOnly className="has-fixed-size" />
            </CardBody>
            <CardFooter className="d-grid gap-2">
                <Button color={"primary"} onClick={() => { navigator.clipboard.writeText(eventMessage); }}>Copy Text</Button>

            </CardFooter>
            {/* <Message color="warning" size="small" className="p-3 m-2">Still need to implement a little toast message when ya copy, sorry, just trying to get this out the door :x</Message> */}
        </Card>
};

export default EventDetails;
