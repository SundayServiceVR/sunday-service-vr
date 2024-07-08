import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import EventRoot from "./features/event/EventRoot";
import Login from './features/auth/Login';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import ResetPassword from './features/auth/ResetPassword';

import EventLineup from './features/event/lineup/EventLineup';
import EventAnnouncements from './features/event/EventAnnouncements';
import Home from './features/home/Home';
import EventList from './features/event/EventList';
import EventCreate from './features/event/basic/EventCreate';
import EventWhiteboard from './features/event/EventWhiteboard';
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

import './App.css';
import CreateDj from './features/dj/CreateDj';
import DjDetails from './features/dj/DjDetails';
import DjList from './features/dj/DjList';
import EventDetails from './features/event/basic/EventDetails';
import EventVerifyDJs from './features/event/lineup/EventVerifyDJs';

function App() {
  // 
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const db = getFirestore();
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

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
          path: "djs",
          children: [
            { index: true, element: <DjList />},
            { path: "create", element: <CreateDj /> },
            { path: ":djId", element: <DjDetails /> },
          ],
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
              path: "past",
              element: <EventList past={true} />
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
                  element: <EventDetails />,
                  handle: { crumb: () => <Link to="setup">Setup</Link>},
                },
                {
                  path: "setup",
                  element: <EventDetails />,
                  handle: { crumb: () => <Link to="setup">Setup</Link>},
                },
                {
                  path: "lineup",
                  element: <EventLineup />,
                  handle: { crumb: () => <Link to="event">Lineup</Link>},
                },
                {
                  path: "verifyDJs",
                  element: <EventVerifyDJs/>,
                  handle: { crumb: () => <Link to="verifyDJs">Verify DJs</Link>}
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
