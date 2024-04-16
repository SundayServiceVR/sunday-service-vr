import React from 'react';
import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import { Home } from './features/home/Home';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import Scheduler from './features/event/Scheduler';
import ResetPassword from './features/auth/ResetPassword';
import Confirm from './features/auth/Confirm';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
          <Route path="/confirm" element={ <AnonymousLayout><Confirm /></AnonymousLayout>} />
          <Route path="/resetPassword" element={ <AnonymousLayout><ResetPassword /></AnonymousLayout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
