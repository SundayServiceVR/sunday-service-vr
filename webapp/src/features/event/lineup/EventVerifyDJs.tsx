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
            </a> in Discord, and make sure the time slots work for all the DJs.
        </p>
        <p>
            After you post, add a little Discord reaction to your message, like a ✅ or a 🦀 or something, so the DJs can quickly react.
        </p>
    </> 

    return (
      <section>
        <h1 className="display-5">Verify DJs</h1>
        <Form>
            <Form.Group>
                <MessagePasteCard message={getProposedLineupMessage(eventScratchpad)} footerInstructions={footerInstructions}/>
            </Form.Group>
        </Form>
      </section>
    );
}

export default EventVerifyDJs;