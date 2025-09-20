import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import EventRoot from "./features/event/EventRoot";
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';

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
import { UserInfo } from './features/user/UserInfo';

import { EventDjPlayMapperProvider } from './contexts/useEventDjCache/eventDjCacheProvider';

import LoginPage from './features/auth/LoginPage';
import { DiscordRedirect } from './features/auth/DiscordRedirect';
import RoleGuard from './components/roleGuard/roleGuard';

import './App.css';
import { EventSignupWizard } from './features/eventSignup/EventSignupWizard';
import { EventSignupStart } from './features/eventSignup/EventSignupStart';
import { EventSignupRoot } from './features/eventSignup/EventSignupRoot';
import BingoHost from './features/bingo/BingoHost';
import BingoPlayer from './features/bingo/BingoPlayer';


function App() {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const db = getFirestore();
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <FirebaseAuthProvider>
        <RoleGuard requireAnyRole={['dj', 'host', 'admin', 'bingo']}>
          <EventDjPlayMapperProvider>
            <Layout />
          </EventDjPlayMapperProvider>
        </RoleGuard>
      </FirebaseAuthProvider>,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "djs",
          children: [
            { index: true, element: <RoleGuard requireAnyRole={['host', 'admin']}><DjList /></RoleGuard>},
            { path: "create", element: <RoleGuard requireAnyRole={['host', 'admin']}><CreateDj /></RoleGuard> },
            { path: ":djId", element: <RoleGuard requireAnyRole={['host', 'admin']}><DjDetails /></RoleGuard> },
          ],
        },
        {
          path: "events",
          handle: { crumb: () => <Link to="/events">Events</Link> },
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
              handle: { crumb: () => <Link to="../">Event</Link> },
              children: eventRoutes
            }
          ]
        },

        {
          path: "discordIdInfo",
          element: <DiscordIdInfo />
        },
        {
          path: "userInfo",
          element: <UserInfo />
        },
      ],
    },
    {
      path: "/bingo",
      element: <FirebaseAuthProvider>
        <RoleGuard requireAnyRole={['bingo', 'dj', 'host', 'admin']}>
          <EventDjPlayMapperProvider>
            <Layout />
          </EventDjPlayMapperProvider>
        </RoleGuard>
      </FirebaseAuthProvider>,
      children: [
        {
          index: true,
          element: <BingoPlayer />
        },
        {
          path: "host-5712788787",
          element: <RoleGuard requireAnyRole={['bingo', 'dj', 'host', 'admin']}>
            <BingoHost />
          </RoleGuard>
        }
      ]
    },
    {
      path: "eventSignup",
      element: <FirebaseAuthProvider>
            <RoleGuard requireAnyRole={['dj', 'host', 'admin']}><Layout /></RoleGuard>
      </FirebaseAuthProvider>,
      children: [
        {
          path: `:eventId`,
          // TODO: Refactor so we don't have two FirebaseAuthProviders
          element: 
              <EventSignupRoot />,

          children: [
            {
              index: true,
              element: <EventSignupStart />
            }, {
              path: "wizard",
              element: <EventSignupWizard />
            }
 
          ]
        },
      ]
    },
    {
      path: "/userInfo",
      element: <FirebaseAuthProvider>
            <RoleGuard requireAnyRole={['dj', 'host', 'admin']}><Layout /></RoleGuard>
      </FirebaseAuthProvider>,
      children: [
        {
          index: true,
          element: <UserInfo />
        },
      ]
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/discordRedirect",
      element: <AnonymousLayout><DiscordRedirect /></AnonymousLayout>
    },
  ]);

  return <>
    <RouterProvider router={router} />
    <Toaster />
  </>;
}

export default App;
