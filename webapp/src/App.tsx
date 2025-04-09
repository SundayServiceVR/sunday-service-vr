import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import EventRoot from "./features/event/EventRoot";
import Login from './features/auth/Login';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import ResetPassword from './features/auth/ResetPassword';

import Home from './features/home/Home';
import EventList from './features/event/EventList';
import EventCreate from './features/event/basic/EventCreate';
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

import CreateDj from './features/dj/CreateDj';
import DjDetails from './features/dj/DjDetails';
import DjList from './features/dj/DjList';
import { Toaster } from 'react-hot-toast';
import { DiscordIdInfo } from './features/dj/discordIdInfo/DiscordIdInfo';
import { eventRoutes } from './features/event/routes';
import GlobalSettings from "./features/globalSettings/GlobalSettings";

import { EventDjPlayMapperProvider } from './contexts/useEventDjCache/eventDjCacheProvider';

import './App.css';

function App() {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const db = getFirestore();
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <FirebaseAuthProvider>
          <EventDjPlayMapperProvider>
            <Layout />
          </EventDjPlayMapperProvider>
        </FirebaseAuthProvider>,
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
              children: eventRoutes
            }
          ]
        },
        {
          path: "discordIdInfo",
          element: <DiscordIdInfo />
        },
        {
          path: "globalSettings",
          element: <GlobalSettings />
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

  return <>
    <RouterProvider router={router} />
    <Toaster />
  </>;
}

export default App;
