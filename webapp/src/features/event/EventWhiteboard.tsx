import { useState } from "react";
import { Button, Card, Form, Stack, Tab, Tabs } from "react-bootstrap";
import { getAusPasteMessage, getUkPasteMessage } from "../../util/messageWriters";
import { useEventOperations } from "./EventRoot";
import { updateBoards } from "../../store/events";

const WhiteboardWriter = () => {
    
    const [eventScratchpad] = useEventOperations();
    const [ buttonText, setButtonText ] = useState<string>("Update Whiteboard");
    const [ buttonEnabled, setButtonEnabled ] = useState<boolean>(true);


    const onUpdateWhiteboard = () => {
        updateBoards(eventScratchpad);
        setButtonText("Update Successful");
        setButtonEnabled(false);
        setTimeout(() => {
            setButtonText("Update Whiteboard");
            setButtonEnabled(true);
        }, 3000)
    }

    return <Card>
        <Card.Body>
            <Card.Title>
                Frontboard Preview
            </Card.Title>

            <Tabs className="mt-4">
                <Tab eventKey="GMT" title="GMT">
                    <Form.Control aria-label="UK whiteboard textbox" as="textarea" value={getUkPasteMessage(eventScratchpad)} rows={16} readOnly className="has-fixed-size" />
                </Tab>
                <Tab eventKey="AU" title="AU">
                    <Form.Control aria-label="AU whiteboard textbox" as="textarea" value={getAusPasteMessage(eventScratchpad)} rows={16} readOnly className="has-fixed-size" />
                </Tab>
            </Tabs>
            <Card.Footer>
                <Stack>
                    <Button disabled={!buttonEnabled} onClick={onUpdateWhiteboard}>{buttonText}</Button>
                </Stack>
                
            </Card.Footer>
        </Card.Body>
    </Card>
}

export default WhiteboardWriter;