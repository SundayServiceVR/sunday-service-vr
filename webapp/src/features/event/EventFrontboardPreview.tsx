import React from "react";
import { Card, Form, Tab, Tabs } from "react-bootstrap";
import { getAusPasteMessage, getUkPasteMessage } from "../../util/messageWriters";
import { Event } from "../../util/types";

type Props = {
    event: Event;
}

const WhiteboardWriter = ({ event }: Props) => {
    return <Card>

        <Card.Body>
            <Card.Title>
                Frontboard Preview
            </Card.Title>

            <Tabs className="mt-4">
                <Tab eventKey="GMT" title="GMT">
                    <Form.Control as="textarea" value={getUkPasteMessage(event)} rows={16} readOnly className="has-fixed-size" />
                </Tab>
                <Tab eventKey="AU" title="AU">
                    <Form.Control as="textarea" value={getAusPasteMessage(event)} rows={16} readOnly className="has-fixed-size" />
                </Tab>
            </Tabs>
        </Card.Body>
    </Card>
}

export default WhiteboardWriter;