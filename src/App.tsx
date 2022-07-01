import React, { useEffect, useReducer } from 'react';
import { Box, Columns, Container, Content } from 'react-bulma-components';
import './App.css';
import EventDetails from './components/EventDetails';
import EventSetup from './components/EventSetup';
import EventForm from './components/EventSetup';
import { default_event } from './util/constants';
import { calcSlotTimes, Event } from './util/types';

function App() {
  
  enum EventActionType {
    SetEvent = "SETEVENT",
    Reset = "RESET",
  }

  type EventAction = {
    type: EventActionType,
    payload: Event
  }

  // https://devtrium.com/posts/how-to-use-react-usereducer-hook
  function eventStateReducer(state: Event, action: EventAction): Event {
    switch (action.type) {
      case EventActionType.SetEvent:
        const event = { ...action.payload };
        calcSlotTimes(event);
        return event;
      case EventActionType.Reset:
        return default_event;
      default:
        throw new Error();
    }
  }

  const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);
  
  useEffect(()=>{
    eventStateDispatch({type: EventActionType.SetEvent, payload: eventState});
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        Sunday Service Message Generator
      </header>
      <Content>
        <Container breakpoint={"fullhd"}>
          <Box>
            <Columns>
              <Columns.Column size={"two-thirds"}>
                <EventSetup djEvent={eventState} setEvent={(event) => { eventStateDispatch({type: EventActionType.SetEvent, payload: event}); }} />
              </Columns.Column>
              <Columns.Column>
                <EventDetails event={eventState} />
              </Columns.Column>
            </Columns>
          </Box>
        </Container>
      </Content>
    </div>
  );
}

export default App;
