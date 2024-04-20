import { Tabs, Tab } from "react-bootstrap";
import EventPasteCard from "./EventPasteCard";
import { getDiscordMessage, getTwitterMessage } from "../../util/messageWriters";
import { useEventOperations } from "./EventRoot";

const EventSocialMediaNotifications = () => {

    const [eventScratchpad] = useEventOperations();

    const discordMessage = getDiscordMessage(eventScratchpad);
    const twitterMessage = getTwitterMessage(eventScratchpad);

    return <div>
            <Tabs className="mt-4">
                <Tab eventKey="discord" title="Discord">
                    <EventPasteCard event={eventScratchpad} message={discordMessage}></EventPasteCard>
                </Tab>
                <Tab eventKey="twitter" title="Twitter">
                    <EventPasteCard event={eventScratchpad} message={twitterMessage}></EventPasteCard>
                </Tab>
            </Tabs>
        </div>
};

export default EventSocialMediaNotifications;
