import { Form } from "react-bootstrap";
import { useEventOperations } from "../outletContext";
import { getProposedLineupMessage } from "../../../util/messageWriters";
import MessagePasteCard from "../messaging/MessagePasteCard";

const EventVerifyDJs = () => {

    const [eventScratchpad] = useEventOperations();
    const footerInstructions = <>
        <p className="mb-0 mt-2">Paste this message to <a target="_blank" 
                rel="noopener noreferrer" 
                href="https://discord.com/channels/1004489038159413248/1204320477732929566">
                    #scheduling
            </a> in Discord, and verify that each DJ is OK with their time slot.
        </p>
        <p>
            After you post, react to your own message with a reaction emoji, like a ✅ or a 🦀 or something, so the DJs can easily click on it to react and confirm their slot.
        </p>
    </> 

    return (
      <section>
        <h1 className="display-6">Verify DJs</h1>
        <p>Before publicly announcing the event lineup, we need to verify in the scheduling channel that the DJs are all still available and are okay with their times:</p>
        <Form>
            <Form.Group>
                <MessagePasteCard message={getProposedLineupMessage(eventScratchpad)} footerInstructions={footerInstructions}/>
            </Form.Group>
        </Form>
      </section>
    );
}

export default EventVerifyDJs;