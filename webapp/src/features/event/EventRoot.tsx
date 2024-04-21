import React, { useEffect, useState } from "react";
import { Alert, Button, Nav, Stack, } from 'react-bootstrap';
import { calcSlotTimes, default_event, docToEvent, saveEvent } from "../../store/events";
import { onSnapshot, doc } from "firebase/firestore";
import { Event } from "../../util/types";
import { db } from "../../util/firebase";
import FloatingActionBar from "../../components/FloatingActionBar";
import { Outlet, useLocation, useOutletContext } from "react-router";
import { Link } from "react-router-dom";


const EventRoot = () => {

    const location = useLocation();

    const [event, setEvent] = useState<Event>(default_event);
    const [eventScratchpad, setEventScratchpad] = useState<Event>(event ?? default_event);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // Listen for changes to the event and reset our actual event when they change.
    useEffect(() => {
        return onSnapshot(doc(db, "events", "current"), (doc) => {
            const event = docToEvent(doc.data());
            if (!event) {
                console.error("Null event returned from current event snapshot listener");
                return;
            }
            setEvent(event);
        });
    }, []);

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
        <h1 className="display-5">{event.name}: {event.start_datetime.toLocaleDateString()}</h1>
        <Nav defaultActiveKey="/event/setup" variant="tabs"  as="ul" activeKey={location.pathname}>
            <Nav.Item as="li">
                <Link to="/event/setup" className="nav-link">Setup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to="/event/lineup" className="nav-link">Lineup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to="/event/announcements" className="nav-link">Announcements</Link>
            </Nav.Item>

        </Nav>
        <Outlet context={[eventScratchpad, proposeEventChange]} />

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

export type EventRouterOutletMemebers = [Event, (event: Event) => void];

export function useEventOperations() {
    return useOutletContext<EventRouterOutletMemebers>();
}

export { }