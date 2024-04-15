import React from 'react';
import Scheduler from './pages/scheduler';
import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

function App() {
  return (
    <div className="App">
      <BrowserRouter basename='/sunday-service-vr'>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={
              <FirebaseAuthProvider>
                <Scheduler />
              </FirebaseAuthProvider>
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
