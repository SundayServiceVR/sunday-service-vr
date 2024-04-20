import React, { useEffect, useState } from "react";
import { Tabs, Tab, Alert, Button, Stack, } from 'react-bootstrap';
import EventSocialMediaNotifications from './EventSocialMediaNotifications';
import EventDetails from './EventDetails';
import { calcSlotTimes, default_event, docToEvent, saveEvent } from "../../store/events";
import EventFrontboardPreview from "./EventFrontboardPreview";
import { onSnapshot, doc } from "firebase/firestore";
import { Event } from "../../util/types";
import { db } from "../../util/firebase";
import FloatingActionBar from "../../components/FloatingActionBar";


const Scheduler = () => {

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
        <Tabs>
            <Tab eventKey="event-setup" title="Event Setup">
                <EventDetails eventScratchpad={eventScratchpad} proposeEventChange={proposeEventChange} />
            </Tab>
            <Tab eventKey="event-notifications" title="Social Media">
                <EventSocialMediaNotifications event={event} />
            </Tab>
            <Tab eventKey="event-ingame" title="Ingame">
                <EventFrontboardPreview event={event} />
            </Tab>
        </Tabs>

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
export default Scheduler;