import { useEffect, useState } from "react";
import { Alert, Breadcrumb, Button, Container, Nav, Stack, } from 'react-bootstrap';
import { calcSlotTimes, default_event, saveEvent } from "../../store/events";
import { docToEvent } from "../../store/converters";
import { onSnapshot, doc } from "firebase/firestore";
import { Event } from "../../util/types";
import { db } from "../../util/firebase";
import FloatingActionBar from "../../components/FloatingActionBar";
import { Outlet, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";


const EventRoot = () => {

    const location = useLocation();

    const [event, setEvent] = useState<Event>(default_event);
    const [eventScratchpad, setEventScratchpad] = useState<Event>(event ?? default_event);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    const { eventId } = useParams();

    // Listen for changes to the event and reset our actual event when they change.
    useEffect(() => {
        if(!eventId) {
            return;
        }

        return onSnapshot(doc(db, "events", eventId), (doc) => {
            const event = docToEvent(doc);
            if (!event) {
                console.error("Null event returned from current event snapshot listener");
                return;
            }
            setEvent(event);
        });
    }, [eventId]);

    // When a new event comes in, we need to set our scratchpad.  If there are active changes, it's time to yell.
    useEffect(() => {
        if (!event) return;
        if (hasChanges) {
            alert("Changes were made outside of this window.");
        } else {
            setEventScratchpad(event);
        }
        // We do not want a change in "hasChanges" to trigger this useEffect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    const proposeEventChange = (newEvent: Event) => {
        calcSlotTimes(newEvent);
        setHasChanges(true);
        setEventScratchpad(newEvent);
    }

    const onSaveEvent = () => {
        saveEvent(eventScratchpad);
        setHasChanges(false);
    }

    const onCancelChanges = () => {
        setHasChanges(false);
        if (!event) return;
        setEventScratchpad(event);
    }

    return <>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/events">Events</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/events/${event.id}`}>{event.id}</Link></Breadcrumb.Item>
        </Breadcrumb>

        <h1 className="display-5">Event: {event.name}, {event.start_datetime.toLocaleDateString()}</h1>

        <Nav defaultActiveKey="/events/setup" variant="tabs"  as="ul" activeKey={location.pathname}>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/setup`}className="nav-link">Setup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/lineup`} className="nav-link">Lineup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/verifyDJs`} className="nav-link">Verify DJs</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/announcements`} className="nav-link">Public Announcements</Link>
            </Nav.Item>
        </Nav>
        
        <Container className="mt-3">
            <Outlet context={[eventScratchpad, proposeEventChange]} />
        </Container>

        <FloatingActionBar hidden={!hasChanges}>
            <Alert variant="primary">
                <div className="mx-auto" />
                <Alert.Heading>You have unsaved changes</Alert.Heading>
                <p>Save your changes to update this event.</p>
                <hr />
                <div className="d-flex justify-content-center">
                    <Stack gap={3} direction="horizontal">
                        <Button onClick={onSaveEvent} color="confirm">Save</Button>
                        <Button onClick={onCancelChanges} color="confirm">Cancel</Button>
                    </Stack>
                </div>
            </Alert>
        </FloatingActionBar>
    </>
}
export default EventRoot;
