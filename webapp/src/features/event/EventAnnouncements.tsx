import { Tabs, Tab, Form } from "react-bootstrap";
import MessagePasteCard from "./messaging/MessagePasteCard";
import { getDiscordMessage, getTwitterMessage } from "../../util/messageWriters";
import { useEventOperations } from "./outletContext";
import { useEventDjCache } from "../../contexts/useEventDjCache";

const EventAnnouncements = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    const { djCache } = useEventDjCache();

    const discordMessage = getDiscordMessage(eventScratchpad, djCache);
    const twitterMessage = getTwitterMessage(eventScratchpad);

    const discordFooterInstructions = <>
        <p className="mb-0 mt-2">Paste your announcement text to <a target="_blank" 
                rel="noopener noreferrer" 
                href="https://discord.com/channels/1004489038159413248/1004489042890588165">
                    #s4-vrchat-events
            </a> in Discord.
        </p>
        <p className="mb-2 ">Be sure to press <strong>📢 Publish</strong> after posting, so other servers that subscribe to the channel get notified!</p>
    </>
    const twitterFooterInstructions = <p className="my-2">Paste this text to Twitter and Bluesky.</p>
    
    return <section>
        <h1 className="display-6">Public Announcements</h1>
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
                <MessagePasteCard 
                textBoxLabel="Discord Announcement Text"
                message={discordMessage} 
                footerInstructions={discordFooterInstructions}
                />
            </Tab>
            <Tab eventKey="twitter" title="Social Media">
                <MessagePasteCard 
                textBoxLabel="Social Media Announcement Text"
                message={twitterMessage}
                footerInstructions={twitterFooterInstructions}
                />
            </Tab>
        </Tabs>
    </section>
};

export default EventAnnouncements;
