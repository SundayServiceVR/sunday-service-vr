import React, { useEffect, useReducer } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EventDetails from './components/EventDetails';
import EventSetup from './components/EventSetup';
import { EventActionType, default_event, eventStateReducer, loadEvent } from './store/events';
import './App.css';

function App() {

  const [eventState, eventStateDispatch] = useReducer(eventStateReducer, default_event);

  useEffect(() => {
    const localStorageEvent = loadEvent();
    eventStateDispatch({ type: EventActionType.SetEvent, payload: localStorageEvent ?? default_event });
  }, []);

  return (
    <div className="App">
      <Container>
        <Row>
          <Col md={8}>
            <EventSetup
              djEvent={eventState}
              setEvent={(event) => { eventStateDispatch({ type: EventActionType.SetEvent, payload: event }); }}
              resetEvent={() => { eventStateDispatch({ type: EventActionType.Reset }); }}
            />
          </Col>
          <Col>
            <EventDetails event={eventState} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
