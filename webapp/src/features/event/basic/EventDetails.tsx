import { useEventOperations } from "../outletContext";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import { Card, CardBody } from "react-bootstrap";
import { getSignupsPostedMessage } from "../../../util/messageWriters";
import MessagePasteCard from "../messaging/MessagePasteCard";
import { useParams } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

const EventDetails = () => {

    const { eventId } = useParams();
    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const message = getSignupsPostedMessage(eventScratchpad, `${window.location.origin}/eventSignup/${eventId}`);


    return <>
        <Card>
            <CardBody>
                <h2 className="display-6">Init Event</h2>
                <EventBasicDetailsForm event={eventScratchpad} onEventChange={proposeEventChange} />
            </CardBody>
        </Card>
        {eventScratchpad.signupsAreOpen &&
            <Card className="mt-4">
                <CardBody>
                    <div>
                        <h2 className="display-6">Signup Sheet</h2>
                        <p>At the start of the week (usually Monday), unlock the S4 signup spreadsheet and post a link to it in <a target="_blank"
                            rel="noopener noreferrer"
                            href="https://discord.com/channels/1004489038159413248/1204320477732929566">
                            #scheduling
                        </a> in Discord.</p>
                        <p>
                            Here's a sample message to get you started.
                        </p>
                        <MessagePasteCard message={message}></MessagePasteCard>
                    </div>
                </CardBody>
            </Card>
        }

    </>
};

export default EventDetails;
