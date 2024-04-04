import React from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Nav} from "react-bootstrap";
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


const getTwitterMessage = (event: Event): string =>
`${event.name}
${event.message}
Twitter Test

DJs:
${event.slots.map(getSlotText).join("\n")}
`;


const getUkPasteMessage = (event: Event): string =>
`${event.name}
${event.message}
UK Test

DJs:
${event.slots.map(getSlotText).join("\n")}
`;


const getAusPasteMessage = (event: Event): string =>
`${event.name}
${event.message}
Australia Test

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

    // const setDiscordMessage = () => {eventMessage = getDiscordMessage(event); console.log("Discord")}
    // const setTwitterMessage = () => {eventMessage = getTwitterMessage(event); console.log("Twitter")}

    const handleSelect = (activeKey : any) => {
        if (activeKey === "discord") console.log("Discord");
        else if (activeKey === "twitter") console.log("Twitter");
        else return ;
    }

    return <Card>
            <CardHeader>Discord Message</CardHeader>
            <CardBody>
                <Nav variant="tabs" defaultActiveKey="discord" onSelect={handleSelect}>
                    <Nav.Item>
                        <Nav.Link eventKey="discord">Discord</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="twitter">Twitter</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="uk">UK Paste</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="au">AU Paste</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Form.Control as="textarea" value={eventMessage} rows={16} readOnly className="has-fixed-size" />
            </CardBody>
            <CardFooter className="d-grid gap-2">
                <Button color={"primary"} onClick={() => { navigator.clipboard.writeText(eventMessage); }}>Copy Text</Button>

            </CardFooter>
            {/* <Message color="warning" size="small" className="p-3 m-2">Still need to implement a little toast message when ya copy, sorry, just trying to get this out the door :x</Message> */}
        </Card>
};

export default EventDetails;
