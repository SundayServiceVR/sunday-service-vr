import { useEffect, useState } from "react";
import { Breadcrumb, Button, Container, Nav, Stack, Toast } from 'react-bootstrap';
import { reconcileEventData, default_event, saveEvent } from "../../store/events";
import { docToEvent } from "../../store/converters";
import { onSnapshot, doc } from "firebase/firestore";
import { Event } from "../../util/types";
import { db } from "../../util/firebase";
import FloatingActionBar from "../../components/FloatingActionBar";
import { Outlet, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import { EventPublishedStatusBadge } from "./EventPublishedStatusBadge";
import toast from "react-hot-toast";


const EventRoot = () => {

    const location = useLocation();

    const [event, setEvent] = useState<Event>(default_event);
    const [eventScratchpad, setEventScratchpad] = useState<Event>(event ?? default_event);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    const { eventId } = useParams();

    // Listen for changes to the event and reset our actual event when they change.
    useEffect(() => {
        if (!eventId) {
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
            toast("Changes were made outside of this window.");
        } else {
            setEventScratchpad(event);
        }
        // We do not want a change in "hasChanges" to trigger this useEffect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    const proposeEventChange = (newEvent: Event) => {
        reconcileEventData(newEvent);
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

    const publishEvent = async () => {
        if (hasChanges) {
            toast.custom(<Toast
                className="d-inline-block m-1"
                bg="warning"
            >
                <Toast.Header closeButton={false}>
                    UwU
                </Toast.Header>
                <Toast.Body>
                    Please save changes before publishing this event.
                </Toast.Body>
            </Toast>
            );

            return;
        }

        const newEvent = { ...event, published: true };

        await saveEvent(newEvent);
        setEventScratchpad(newEvent);
    }

    return <>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/events">Events</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/events/${event.id}`}>{event.id}</Link></Breadcrumb.Item>
        </Breadcrumb>

        <Stack direction="horizontal" gap={3}>
            <h2 className="display-4">
                {event.name} ({event.start_datetime.toLocaleDateString()})
            </h2>


            <EventPublishedStatusBadge event={event} />
            <div className="ms-auto" />
            {!event.published && <Button size="lg" onClick={publishEvent}>Publish Event</Button>}
        </Stack>

        <Nav defaultActiveKey="/events/setup" variant="tabs" as="ul" activeKey={location.pathname}>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/setup`} className="nav-link">Setup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/lineup`} className="nav-link">Lineup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/verifyDJs`} className="nav-link">Verify DJs</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/technicalDetails`} className="nav-link">Stream Details</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/announcements`} className="nav-link">Messaging</Link>
            </Nav.Item>

        </Nav>

        <Container className="mt-3">
            <Outlet context={[eventScratchpad, proposeEventChange]} />
        </Container>

        <FloatingActionBar hidden={!hasChanges}>
            <Container>
                <Stack direction="horizontal" gap={3} className="justify-content-end">
                    <div className="d-flex align-items-center text-secondary">Save your Changes</div>
                    <Button onClick={onSaveEvent} variant="primary">Save</Button>
                    <Button onClick={onCancelChanges} variant="secondary">Discard</Button>
                </Stack>
            </Container>
        </FloatingActionBar >
    </>
}
export default EventRoot;
