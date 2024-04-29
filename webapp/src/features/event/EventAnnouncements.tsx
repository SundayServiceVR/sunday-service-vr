import { Tabs, Tab, Form } from "react-bootstrap";
import EventPasteCard from "./EventPasteCard";
import { getDiscordMessage, getTwitterMessage } from "../../util/messageWriters";
import { useEventOperations } from "./EventRoot";

const EventAnnouncements = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    const discordMessage = getDiscordMessage(eventScratchpad);
    const twitterMessage = getTwitterMessage(eventScratchpad);

    return <section>
        <h1 className="display-5">Announcements</h1>
        <Form>
            <Form.Group>
                <Form.Label>
                    Discord Announcement Message
                </Form.Label>
                <Form.Control
                    placeholder="Event Message Goes Here"
                    type="text"
                    as="textarea"
                    rows={8}
                    value={eventScratchpad.message}
                    onChange={(event) => { proposeEventChange({ ...eventScratchpad, message: event.target.value }); }}
                />
            </Form.Group>
        </Form>
        <Tabs className="mt-4">
            <Tab eventKey="discord" title="Discord">
                <EventPasteCard 
                message={discordMessage} 
                destinationText="s4-vrchat-events"
                destinationLink="https://discord.com/channels/1004489038159413248/1004489042890588165"/>
            </Tab>
            <Tab eventKey="twitter" title="Social Media">
                <EventPasteCard 
                message={twitterMessage}
                destinationText="Twitter and Bluesky"/>
            </Tab>
        </Tabs>
    </section>
};

export default EventAnnouncements;
