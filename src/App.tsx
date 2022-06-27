import React, { useState } from 'react';
import { Box, Columns, Container, Content } from 'react-bulma-components';
import './App.css';
import EventDetails from './components/EventDetails';
import EventForm from './components/EventForm';
import { default_event } from './util/constants';

function App() {

  const [state, setState] = useState({
    event: default_event
  });

  return (
    <div className="App">
      <header className="App-header">
        Sunday Service
      </header>
      <Content>
        <Container breakpoint={"fullhd"}>
          <Box>
            <Columns>
              <Columns.Column>
                <EventForm event={state.event} setEvent={(event) => { setState({ ...state, event }) }} />
              </Columns.Column>
              <Columns.Column>
                <EventDetails event={state.event} setEvent={(event) => { setState({ ...state, event }) }} />
              </Columns.Column>
            </Columns>
          </Box>
        </Container>
      </Content>
    </div>
  );
}

export default App;
