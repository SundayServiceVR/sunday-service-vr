import { useEventOperations } from "../outletContext";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Card, CardBody, Form } from "react-bootstrap";
import { getSignupsPostedMessage } from "../../../util/messageWriters";

const EventDetails = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const message = getSignupsPostedMessage(eventScratchpad);

    return <>
        <Card>
            <CardBody>
                <h2 className="display-6">Event Setup</h2>
                <EventBasicDetailsForm event={eventScratchpad} onEventChange={proposeEventChange} />
            </CardBody>
        </Card>
        <Card className="mt-4">
            <CardBody>
                <div>
                    <h3 className="mb-3">Signup Sheet</h3>
                    <p>At the start of the week (usually Monday), unlock the S4 signup spreadsheet and post a link to it in <a target="_blank"
                        rel="noopener noreferrer"
                        href="https://discord.com/channels/1004489038159413248/1204320477732929566">
                            #scheduling
                    </a> in Discord.</p>
                    <p>
                        Here's a sample message to get you started. <strong>Be sure to add a ping to <span style={{color: "#9B59B6"}}>@Saltare Musica Hospite</span> at the end!</strong>
                    </p>
                    <div className="d-grid gap-2">
                        <Form.Control as="textarea" value={message} rows={8} readOnly className="has-fixed-size" />
                        <Button color={"primary"} className="mt-3 mb-2" onClick={() => { navigator.clipboard.writeText(message); }}>Copy Text</Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    </>
};

export default EventDetails;
