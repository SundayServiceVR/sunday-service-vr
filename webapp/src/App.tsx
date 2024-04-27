import React from 'react';

import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import EventRoot from "./features/event/EventRoot";
import Login from './features/auth/Login';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import ResetPassword from './features/auth/ResetPassword';

import EventLineup from './features/event/EventLineup';
import EventAnnouncements from './features/event/EventAnnouncements';
import Home from './features/home/Home';
import EventSetup from './features/event/EventSetup';
import EventList from './features/event/EventList';
import EventCreate from './features/event/EventCreate';
import EventWhiteboard from './features/event/EventWhiteboard';

import './App.css';

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <FirebaseAuthProvider><Layout /></FirebaseAuthProvider>,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "events",
          handle: { crumb: () => <Link to="/events">Events</Link>},
          children: [
            {
              index: true,
              element: <EventList />
            },
            {
              path: "create",
              element: <EventCreate />
            },
            {
              path: ":eventId",
              element: <EventRoot />,
              handle: { crumb: () => <Link to="../">Event</Link>},
              children: [
                {
                  index: true,
                  element: <EventSetup />,
                  handle: { crumb: () => <Link to="setup">Setup</Link>},
                },
                {
                  path: "setup",
                  element: <EventSetup />,
                  handle: { crumb: () => <Link to="setup">Setup</Link>},
                },
                {
                  path: "lineup",
                  element: <EventLineup />,
                  handle: { crumb: () => <Link to="event">Lineup</Link>},
                },
                {
                  path: "announcements",
                  element: <EventAnnouncements />,
                  handle: { crumb: () => <Link to="announcements">Announcements</Link>},
                },
                {
                  path: "whiteboard",
                  element: <EventWhiteboard />,
                  handle: { crumb: () => <Link to="whiteboard">Frontboard Preview</Link>},
                },
              ]
            }
          ]
        },
      ],
    },
    {
      path: "/login",
      element: <AnonymousLayout><Login /></AnonymousLayout>
    },
    {
      path: "/resetPassword",
      element: <AnonymousLayout><ResetPassword /></AnonymousLayout>
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
