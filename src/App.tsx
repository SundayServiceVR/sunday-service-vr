import React from 'react';
import './App.css';
import EventDetails from './components/EventDetails';
import { Event, RESIDENT_DJS } from './types/types';

const test_event: Event = {
  name: "bleatr's test extraviganza",
  start_datetime: new Date(),
  slots: [{
      dj: RESIDENT_DJS.kittz,
      duration: 1,
  },{
      dj: RESIDENT_DJS.bleatr,
      duration: 1,
  },{
      dj: RESIDENT_DJS.whitty,
      duration: 1,
  },{
      dj: RESIDENT_DJS.StrawberryProtato,
      duration: 1,
  }]
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Sunday Service
      </header>
      <div>
        <EventDetails event={test_event}/>
      </div>
    </div>
  );
}

export default App;
