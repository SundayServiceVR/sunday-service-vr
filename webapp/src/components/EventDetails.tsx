import React from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Tabs, Tab} from "react-bootstrap";
import { Event, Slot } from "../util/types";
import EventPasteCard from "./EventPasteCard";


type Props = {
    event: Event
};


const getDiscordMessage = (event: Event): string => 
`${event.name}

${event.message}

Event start: ${dateToDiscordTime(event.start_datetime)}

Host: ${event.host}

DJs:
${event.slots.map(getDiscordSlotText).join("\n")}
`;


const getTwitterMessage = (event: Event): string =>
`${event.name}
${event.start_datetime.toISOString().split('T')[0]}
Host: ${event.host}

Lineup: (times GMT)
${event.slots.map(getPasteSlotText).join("\n")}
`;


const getUkPasteMessage = (event: Event): string =>
`${event.name}
${event.start_datetime.toISOString().split('T')[0]}
Host: ${event.host}

Lineup: (times GMT)
${event.slots.map(getPasteSlotText).join("\n")}
`;


const getAusPasteMessage = (event: Event): string =>
`${event.name}
${event.start_datetime.toISOString().split('T')[0]}
Host: ${event.host}

Lineup: (times are NOT RIGHT!!!!!!!! [to-do])
${event.slots.map(getPasteSlotText).join("\n")}
`;


const dateToDiscordTime = (date: Date): string => {
    // Example: <t:1656270000:R>
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}

const dateToPasteTime = (date : Date): string => {
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}


const getDiscordSlotText = (slot: Slot): string => {
    let slotText = `${slot.startTime ? dateToDiscordTime(slot.startTime) : ""} : ${slot.dj.name}`;
    if(slot.dj.twitch_url) {
        slotText = `${slotText} - ${slot.dj.twitch_url}`
    }
    return slotText;
}

const getPasteSlotText = (slot : Slot): string => {
    let slotText = `${slot.dj.name} - ${slot.startTime ? dateToPasteTime(slot.startTime) : ""}`;
    return slotText;
}


const EventDetails = ({ event }: Props) => {

    const discordMessage = getDiscordMessage(event);
    const twitterMessage = getTwitterMessage(event);
    const ukMessage = getUkPasteMessage(event);
    const ausMessage = getAusPasteMessage(event);

    return <div>

            <Tabs className="mt-4">
                <Tab eventKey="discord" title="Discord">
                    <EventPasteCard event={event} message={discordMessage}></EventPasteCard>
                </Tab>
                <Tab eventKey="twitter" title="Twitter">
                    <EventPasteCard event={event} message={twitterMessage}></EventPasteCard>
                </Tab>
                <Tab eventKey="uk" title="UK Paste">
                    <EventPasteCard event={event} message={ukMessage}></EventPasteCard>
                </Tab>
                <Tab eventKey="au" title="AU Paste">
                    <EventPasteCard event={event} message={ausMessage}></EventPasteCard>

                </Tab>
            </Tabs>
            {/* <Message color="warning" size="small" className="p-3 m-2">Still need to implement a little toast message when ya copy, sorry, just trying to get this out the door :x</Message> */}
            
        </div>
};

export default EventDetails;
