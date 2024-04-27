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
                    Event Name
                </Form.Label>
                <Form.Control
                    placeholder="Event Message Goes Here"
                    type="text"
                    as="textarea"
                    value={eventScratchpad.message}
                    onChange={(event) => { proposeEventChange({ ...eventScratchpad, message: event.target.value }); }}
                />
            </Form.Group>
        </Form>
        <Tabs className="mt-4">
            <Tab eventKey="discord" title="Discord">
                <EventPasteCard event={eventScratchpad} message={discordMessage}></EventPasteCard>
            </Tab>
            <Tab eventKey="twitter" title="Twitter">
                <EventPasteCard event={eventScratchpad} message={twitterMessage}></EventPasteCard>
            </Tab>
        </Tabs>
    </section>
};

export default EventAnnouncements;
