import React from "react";
import { Tabs, Tab} from "react-bootstrap";
import { Event } from "../../util/types";
import EventPasteCard from "./EventPasteCard";
import { getDiscordMessage, getTwitterMessage } from "../../util/messageWriters";

type Props = {
    event: Event
};

const EventSocialMediaNotifications = ({ event }: Props) => {
    const discordMessage = getDiscordMessage(event);
    const twitterMessage = getTwitterMessage(event);
    return <div>
            <Tabs className="mt-4">
                <Tab eventKey="discord" title="Discord">
                    <EventPasteCard event={event} message={discordMessage}></EventPasteCard>
                </Tab>
                <Tab eventKey="twitter" title="Twitter">
                    <EventPasteCard event={event} message={twitterMessage}></EventPasteCard>
                </Tab>
            </Tabs>
        </div>
};

export default EventSocialMediaNotifications;
