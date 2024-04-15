import React, { useEffect, useReducer } from "react";
import { Tabs, Tab, } from 'react-bootstrap';
import EventDetails from './EventDetails';
import EventSetup from './EventSetup';
import { default_event, EventActionType, eventStateReducer, loadEvent } from "../../store/events";


const Scheduler = () => {

    const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);

    useEffect(() => {
      const localStorageEvent = loadEvent();
      eventStateDispatch({ type: EventActionType.SetEvent, payload: localStorageEvent ?? default_event });
    }, []);

    return <Tabs>
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
}
export default Scheduler;