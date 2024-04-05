import React from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Tabs, Tab} from "react-bootstrap";
import { Event, Slot } from "../util/types";
import EventPasteCard from "./EventPasteCard";
import dayjs from "dayjs";


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


const getTwitterMessage = (event: Event): string => {
    const ukDayTz = dayjs.tz(event.start_datetime, "GB");
return `${event.name}
${ukDayTz.format("YYYY-MM-DD")}
Host: ${event.host}

Lineup: (times ${ukDayTz.format('z')
                        .replace("GMT+1","BST")})
${event.slots.map(getUkPasteSlotText).join("\n")}
`;
}


const getUkPasteMessage = (event: Event): string => {
    const ukDayTz = dayjs.tz(event.start_datetime, "GB");
return `${event.name}
${ukDayTz.format("YYYY-MM-DD")}
Host: ${event.host}

Lineup: (times ${ukDayTz.format('z')
                        .replace("GMT+1","BST")})
${event.slots.map(getUkPasteSlotText).join("\n")}
`;
}


const getAusPasteMessage = (event: Event): string =>{
    const ausDayTz = dayjs.tz(event.start_datetime, "Australia/Sydney");
    return `${event.name}
${ausDayTz.format("YYYY-MM-DD")}
Host: ${event.host}

Lineup: (times ${ausDayTz.format('z')
                        .replace("GMT+11","AEDT")
                        .replace("GMT+10","AEST")})
${event.slots.map(getAusPasteSlotText).join("\n")}
`;
}


const dateToDiscordTime = (date: Date): string => {
    // Example: <t:1656270000:R>
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}


const getDiscordSlotText = (slot: Slot): string => {
    let slotText = `${slot.startTime ? dateToDiscordTime(slot.startTime) : ""} : ${slot.dj.name}`;
    if(slot.dj.twitch_url) {
        slotText = `${slotText} - ${slot.dj.twitch_url}`
    }
    return slotText;
}


const getUkPasteSlotText = (slot : Slot): string => {
    let slotText = `${slot.startTime ? dateToUkPasteTime(slot.startTime) : ""} ${slot.dj.name}`;
    return slotText;
}


const getAusPasteSlotText = (slot : Slot): string => {
    let slotText = `${slot.startTime ? dateToAusPasteTime(slot.startTime) : ""} ${slot.dj.name}`;
    return slotText;
}


const dateToUkPasteTime = (date : Date): string => {
    return `${dayjs.tz(date, "Europe/London").format('h:mma').slice(0,-1)}`;
}


const dateToAusPasteTime = (date : Date): string => {
    return `${dayjs.tz(date, "Australia/Sydney").format('h:mma').slice(0,-1)}`;
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
