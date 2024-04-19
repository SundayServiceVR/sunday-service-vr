import React, { useEffect, useReducer } from "react";
import { Tabs, Tab, } from 'react-bootstrap';
import EventSocialMediaNotifications from './EventSocialMediaNotifications';
import EventSetup from './EventSetup';
import { default_event, EventActionType, eventStateReducer, loadEvent } from "../../store/events";
import WhiteboardWriter from "./WhiteboardWriter";


const Scheduler = () => {

    const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);

    useEffect(() => {
        (async ()=>{
            const event = await loadEvent();
            eventStateDispatch({ type: EventActionType.SetEvent, payload: event ?? default_event });
        })()
    }, []);

    return <Tabs>
        <Tab eventKey="event-setup" title="Event Setup">
            <EventSetup
            djEvent={eventState}
            setEvent={(event) => { eventStateDispatch({ type: EventActionType.SetEvent, payload: event }); }}
            resetEvent={() => { eventStateDispatch({ type: EventActionType.Reset }); }}
            />
        </Tab>
        <Tab eventKey="event-notifications" title="Social Media">
            <EventSocialMediaNotifications event={eventState} />
        </Tab>
        <Tab eventKey="event-ingame" title="Ingame">
            <WhiteboardWriter event={eventState} />
        </Tab>
    </Tabs>
}
export default Scheduler;