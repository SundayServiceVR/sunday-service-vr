import React from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { resetEvent } from "../../store/events";
import { useEventOperations } from "./EventRoot";
import "react-datepicker/dist/react-datepicker.css";

const EventDetails = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    return <Container>
        <Row>
            <Col>
                <h2 className="display-6">Event Setup</h2>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form>
                    <Form.Group>
                        <Form.Label>
                            Event Name
                        </Form.Label>
                        <Form.Control
                            placeholder="Sunday Service"
                            type="text"
                            value={eventScratchpad.name}
                            onChange={(event) => { proposeEventChange({ ...eventScratchpad, name: event.target.value }); }}
                        />
                    </Form.Group>
                    <Form.Group className="mt-2">
                        <Form.Label>
                            Date/Time (Local)
                        </Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={new Date(eventScratchpad.start_datetime.getTime() - eventScratchpad.start_datetime.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)}
                            onChange={(event) => {
                                proposeEventChange({ ...eventScratchpad, start_datetime: new Date(event.target.value) })
                            }}
                            className="input" />

                    </Form.Group>
                    <Form.Group className="mt-2">
                        <Form.Label>
                            Host
                        </Form.Label>
                        <Form.Control
                            placeholder="Strawbs"
                            type="text"
                            value={eventScratchpad.host}
                            onChange={(event) => { proposeEventChange({ ...eventScratchpad, host: event.target.value }); }}
                        />
                    </Form.Group>
                </Form>
            </Col>
            <Col sm={12} md={4}>
                <Card className="mt-4">
                    <Card.Header>Event Reset</Card.Header>
                    <Card.Body>
                        
                        <p>At the start of each week, reset the event here.</p>
                        <div className="text-center">
                            <Button
                                size="lg"
                                placeholder="Sunday Service"
                                value={eventScratchpad.name}
                                // TODO: Make a confirmation dialog component
                                onClick={(_: any) => { if (window.confirm("Reset the event?  (Date will be updated to next sunday)")) { resetEvent(); } }}
                                variant={"outline-danger"}
                            >Reset Event</Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
};

export default EventDetails;
