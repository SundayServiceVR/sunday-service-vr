import { useEventOperations } from "../outletContext";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Card, CardBody, Form } from "react-bootstrap";
import { getScheduleVerifyMessage } from "../../../util/messageWriters";

const EventDetails = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const message = getScheduleVerifyMessage(eventScratchpad);

    return <>
        <Card>
            <CardBody>
                <h2 className="display-6">Event Setup</h2>
                <EventBasicDetailsForm event={eventScratchpad} onEventChange={proposeEventChange} />
            </CardBody>
        </Card>
        <Card className="mt-4">
            <CardBody>
                <div className="d-grid gap-2">
                    <h3>Signup Sheet</h3>
                    <p>At the start of the week (usually Monday), unlock the S4 signup spreadsheet and post a link to it in <a target="_blank"
                        rel="noopener noreferrer"
                        href="https://discord.com/channels/1004489038159413248/1204320477732929566">
                            #scheduling
                    </a> in Discord.</p>
                    <p>Feel free to customize this message a bit. Have fun with it!</p>
                    <p>
                        Here's a basic message to get you started:
                    </p>
                    <Form.Control as="textarea" value={message} rows={5} readOnly className="has-fixed-size" />
                    <Button color={"primary"} onClick={() => { navigator.clipboard.writeText(message); }}>Copy Text</Button>
                    <p>Be sure to add a ping to <span style={{color: "#9B59B6"}}><strong>@Saltare Musica Hospite</strong></span> at the end!</p>
                </div>
            </CardBody>
        </Card>
    </>
};

export default EventDetails;
