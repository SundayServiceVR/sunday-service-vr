import React, { useEffect, useReducer } from 'react';
import { Columns, Container, Content } from 'react-bulma-components';
import './App.css';
import EventDetails from './components/EventDetails';
import EventSetup from './components/EventSetup';
import { default_event } from './util/constants';
import { calcSlotTimes, Event, loadEvent, saveEvent } from './util/types';

function App() {
  
  enum EventActionType {
    SetEvent = "SETEVENT",
    Reset = "RESET",
  }

  type EventAction = {
    type: EventActionType,
    payload?: Event
  }

  // https://devtrium.com/posts/how-to-use-react-usereducer-hook
  function eventStateReducer(state: Event, action: EventAction): Event {
    switch (action.type) {
      case EventActionType.SetEvent:
        if (action.payload !== undefined) {
          const event = { ...action.payload };
          calcSlotTimes(event);
          saveEvent(event);
          return event;
        } else {
          throw new Error("Expected an payload to be populated, but it was undefined");
        }

      case EventActionType.Reset:
        saveEvent(default_event);
        return default_event;
      default:
        throw new Error();
    }
  }

  const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);
  
  useEffect(()=>{
    const localStorageEvent = loadEvent();
    eventStateDispatch({type: EventActionType.SetEvent, payload: localStorageEvent ?? default_event});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <Content>
        <Container>
            <Columns>
              <Columns.Column size={"two-thirds"}>
                <EventSetup
                  djEvent={eventState}
                  setEvent={(event) => { eventStateDispatch({type: EventActionType.SetEvent, payload: event}); }} 
                  resetEvent={() => { eventStateDispatch({type: EventActionType.Reset}); }} 
                  />
              </Columns.Column>
              <Columns.Column>
                <EventDetails event={eventState} />
              </Columns.Column>
            </Columns>
        </Container>
      </Content>
    </div>
  );
}

export default App;
