import React from 'react';

import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import EventRoot from "./features/event/EventRoot";
import Login from './features/auth/Login';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import ResetPassword from './features/auth/ResetPassword';

import './App.css';
import EventDetails from './features/event/EventDetails';
import EventFrontboardPreview from './features/event/EventFrontboardPreview';
import EventSocialMediaNotifications from './features/event/EventSocialMediaNotifications';
import Home from './features/Home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FirebaseAuthProvider><Layout /></FirebaseAuthProvider>}>
            <Route index element={<Home />} />
            <Route path="event" element={<EventRoot />}>
              <Route path="setup" element={<EventDetails />} />
              <Route path="socialMedia" element={<EventSocialMediaNotifications />} />
              <Route path="whiteboardPreview" element={<EventFrontboardPreview />} />
            </Route>
          </Route>
          <Route path="/login" element={<AnonymousLayout><Login /></AnonymousLayout>} />
          <Route path="/resetPassword" element={<AnonymousLayout><ResetPassword /></AnonymousLayout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
