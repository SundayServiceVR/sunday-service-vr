import { useEffect, useState } from "react";
import Spinner from "../spinner";
import { Event } from "../../util/types";
import { getCurrentEvent, getNextEvent } from "../../store/events";
import { Card, Col, Container, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

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

    if (loading) {
        return <Spinner type="simple" />
    }

    if (event === null || event === undefined) {
        return <></>
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