import React, { useEffect, useReducer } from "react";
import { Container, Tabs, Tab, Navbar } from 'react-bootstrap';
import EventDetails from '../components/EventDetails';
import EventSetup from '../components/EventSetup';
import { default_event, EventActionType, eventStateReducer, loadEvent } from "../store/events";


const Scheduler = () => {

    const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);

    useEffect(() => {
      const localStorageEvent = loadEvent();
      eventStateDispatch({ type: EventActionType.SetEvent, payload: localStorageEvent ?? default_event });
    }, []);

    return <>
        <Navbar expand="lg" className="bg-body-secondary" data-bs-theme="dark">
            <Navbar.Brand className="px-3">S4</Navbar.Brand>
        </Navbar>
        <Container className="mt-1">
            <Tabs>
            <Tab eventKey="event-setup" title="Event Setup">
                <EventSetup
                djEvent={eventState}
                setEvent={(event) => { eventStateDispatch({ type: EventActionType.SetEvent, payload: event }); }}
                resetEvent={() => { eventStateDispatch({ type: EventActionType.Reset }); }}
                />
            </Tab>
            <Tab eventKey="event-notifications" title="Notification Helper">
                <EventDetails event={eventState} />
            </Tab>
            </Tabs>
        </Container>
    </>
}
export default Scheduler;