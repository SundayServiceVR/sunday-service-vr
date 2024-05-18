import { Tabs, Tab, Form } from "react-bootstrap";
import EventPasteCard from "./EventPasteCard";
import { getDiscordMessage, getTwitterMessage } from "../../util/messageWriters";
import { useEventOperations } from "./EventRoot";

const EventAnnouncements = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    const discordMessage = getDiscordMessage(eventScratchpad);
    const twitterMessage = getTwitterMessage(eventScratchpad);

    const discordFooterInstructions = <>
        <p className="mb-0 mt-2">Paste your announcement text to <a target="_blank" 
                rel="noopener noreferrer" 
                href="https://discord.com/channels/1004489038159413248/1004489042890588165">
                    #s4-vrchat-events
            </a> in Discord.
        </p>
        <p className="mb-2 ">Be sure to add a ping to <span style={{color: "#eac645"}}><strong>@Congregatio Mirabilis</strong></span> and press <strong>📢 Publish</strong> after posting, so all members and servers get notified!</p>
    </>
    const twitterFooterInstructions = <p className="my-2">Paste this text to Twitter and Bluesky.</p>
    
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
                textBoxLabel="Discord Announcement Text"
                message={discordMessage} 
                footerInstructions={discordFooterInstructions}
                />
            </Tab>
            <Tab eventKey="twitter" title="Social Media">
                <EventPasteCard 
                textBoxLabel="Social Media Announcement Text"
                message={twitterMessage}
                footerInstructions={twitterFooterInstructions}
                />
            </Tab>
        </Tabs>
    </section>
};

export default EventAnnouncements;
