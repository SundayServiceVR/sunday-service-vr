import React, { useEffect, useReducer } from 'react';
import { Columns, Container, Content } from 'react-bulma-components';
import './App.css';
import EventDetails from './components/EventDetails';
import EventSetup from './components/EventSetup';
import { EventActionType, default_event, eventStateReducer, loadEvent } from './store/events';

function App() {

  const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);
  
  useEffect(()=>{
    const localStorageEvent = loadEvent();
    eventStateDispatch({type: EventActionType.SetEvent, payload: localStorageEvent ?? default_event});
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
