import React from 'react';
import Scheduler from './features/event/Scheduler';
import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import { Home } from './features/home/Home';
import Layout from './features/layout/Layout';
import Logout from './features/auth/Logout';
import AnonymousLayout from './features/layout/AnonymousLayout';

function App() {
  return (
    <div className="App">
      <BrowserRouter basename='/sunday-service-vr'>
        <Routes>
          <Route path="/" element={
              <FirebaseAuthProvider>
                <Layout />
              </FirebaseAuthProvider>
            } 
          >
            <Route index element={<Home />} />
          </Route>
          <Route path="/event" element={
              <FirebaseAuthProvider>
                <Layout />
              </FirebaseAuthProvider>
            } 
          >
            <Route index element={<Scheduler />}/>
          </Route>
          <Route path="/login" element={ <AnonymousLayout><Login /></AnonymousLayout>} /> 
          <Route path="/signup" element={ <AnonymousLayout><Signup /></AnonymousLayout>} />
          <Route path="/logout" element={ <AnonymousLayout><Logout /></AnonymousLayout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
