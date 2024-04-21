import React from 'react';

import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

import EventRoot from "./features/event/EventRoot";
import Login from './features/auth/Login';
import Layout from './features/layout/Layout';
import AnonymousLayout from './features/layout/AnonymousLayout';
import ResetPassword from './features/auth/ResetPassword';

import './App.css';
import EventLineup from './features/event/EventLineup';
import EventAnnouncements from './features/event/EventAnnouncements';
import Home from './features/Home';
import EventSetup from './features/event/EventSetup';
import EventList from './features/event/EventList';
import EventCreate from './features/event/EventCreate';
import EventWhiteboard from './features/event/EventWhiteboard';

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
        {
          path: "/login",
          element: <AnonymousLayout><Login /></AnonymousLayout>
        },
        {
          path: "/resetPassword",
          element: <AnonymousLayout><ResetPassword /></AnonymousLayout>
        }
      ],
    },
  ]);

  return <RouterProvider router={router} />;

  // return (
  //   <div className="App">
  //     <BrowserRouter>
  //       <Routes>
  //         <Route path="/" element={<FirebaseAuthProvider><Layout /></FirebaseAuthProvider>}>
  //           <Route index element={<Home />} />
  //           <Route path="events" handle={{ crumb: () => <Link to="/events">Events</Link>}}>
  //             <Route index element={<EventList />} />
  //             <Route path=":eventId" element={<EventRoot />}>
  //               <Route index element={<EventSetup />} />
  //               <Route path="setup" element={<EventSetup />} />
  //               <Route path="lineup" element={<EventLineup />} />
  //               <Route path="announcements" element={<EventAnnouncements />} />
  //               <Route path="whiteboardPreview" element={<EventFrontboardPreview />} />
  //             </Route>
  //           </Route>
  //         </Route>
  //         <Route path="/login" element={<AnonymousLayout><Login /></AnonymousLayout>} />
  //         <Route path="/resetPassword" element={<AnonymousLayout><ResetPassword /></AnonymousLayout>} />
  //       </Routes>
  //     </BrowserRouter>
  //   </div>
  // );
}

export default App;
