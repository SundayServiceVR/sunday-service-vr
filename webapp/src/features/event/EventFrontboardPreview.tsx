import React from "react";
import { Card, Form, Tab, Tabs } from "react-bootstrap";
import { getAusPasteMessage, getUkPasteMessage } from "../../util/messageWriters";
import { useEventOperations } from "./EventRoot";

const WhiteboardWriter = () => {
    
    const [eventScratchpad] = useEventOperations();

    return <Card>
        <Card.Body>
            <Card.Title>
                Frontboard Preview
            </Card.Title>

            <Tabs className="mt-4">
                <Tab eventKey="GMT" title="GMT">
                    <Form.Control as="textarea" value={getUkPasteMessage(eventScratchpad)} rows={16} readOnly className="has-fixed-size" />
                </Tab>
                <Tab eventKey="AU" title="AU">
                    <Form.Control as="textarea" value={getAusPasteMessage(eventScratchpad)} rows={16} readOnly className="has-fixed-size" />
                </Tab>
            </Tabs>
        </Card.Body>
    </Card>
}

export default WhiteboardWriter;