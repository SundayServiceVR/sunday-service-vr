import { useEffect, useState } from "react";
import { Event } from "../../util/types";
import { getCurrentEvent, getNextEvent } from "../../store/events";
import { Alert, AlertHeading, Button, Card, Col, Container, ListGroup, ListGroupItem, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

export const CurrentOrNextEvent = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [isCurrentEvent, setIsCurrentEvent] = useState<boolean>(true);
    const [event, setEvent] = useState<Event | null>();

    useEffect(() => {
        setLoading(true);
        (async () => {
            let fetchedEvent = await getCurrentEvent();
            if (!fetchedEvent) {
                fetchedEvent = await getNextEvent();
                setIsCurrentEvent(false);
            }
            setEvent(fetchedEvent);
            setLoading(false);
        })()
    }, []);

    // Undefined = we haven't tried to fetch it yet
    if (event === undefined) {
        return <></>
    }

    // loading = we're trying to fetch it
    if (loading) {
        return <Spinner />
    }

    // Null = we tried to fetch it but we didn't find anything
    if (event === null) {
        return <Alert variant="warning" className="my-3 mx-auto" style={{maxWidth: "42em"}}>
            <AlertHeading className="text-center">No Upcoming Events Found</AlertHeading>
            <p className="text-center">Get started by creating a new event.</p>
            <Container>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <LinkContainer to="/events/create"><Button size="lg">Create Event</Button></LinkContainer>
                    </Col>
                </Row>

            </Container>
        </Alert>
    }

    return <Container className="my-3">
        <Row xs={1} className="g-4">
            <Col>
                <Card border={isCurrentEvent ? "primary" : ""} className="mx-auto" style={{ maxWidth: '42em' }}>
                    {/* <Card.Img variant="top" src="holder.js/100px160" /> */}
                    <Card.Header>{isCurrentEvent ? "Current Event" : "Next Event"}</Card.Header>
                    <Card.Body>
    
                        <Card.Title>{event.name}</Card.Title>
                        <Card.Text>
                            <Row className="justify-content-md-center">
                                <Col className="d-flex align-items-center" xs={12} sm={6}>
                                    <dl className="mx-2">
                                        <dt>Date</dt>
                                        <dd>{event.start_datetime.toDateString()}</dd>
                                        <dt>Host</dt>
                                        <dd>{event.host}</dd>
                                    </dl>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <ListGroup>
                                        <ListGroupItem><Link to={`/events/${event.id}/setup`}>Event Setup</Link></ListGroupItem>
                                        <ListGroupItem><Link to={`/events/${event.id}/lineup`}>Lineup</Link></ListGroupItem>
                                        <ListGroupItem><Link to={`/events/${event.id}/verifyDJs`}>Verify DJs</Link></ListGroupItem>
                                        <ListGroupItem><Link to={`/events/${event.id}/announcements`}>Public Announcements</Link></ListGroupItem>
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
}