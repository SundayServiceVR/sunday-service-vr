import React from 'react';

import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import Login from './features/auth/Login';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import Scheduler from './features/event/Event';
import ResetPassword from './features/auth/ResetPassword';

import './App.css';

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
            <Route index element={<Scheduler />}/>
          </Route>
          <Route path="/login" element={ <AnonymousLayout><Login /></AnonymousLayout>} /> 
          <Route path="/resetPassword" element={ <AnonymousLayout><ResetPassword /></AnonymousLayout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
