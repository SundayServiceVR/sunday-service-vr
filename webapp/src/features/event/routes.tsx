import { Link, RouteObject } from "react-router-dom";
import EventDetails from "./basic/EventDetails";
import EventAnnouncements from "./EventAnnouncements";
import EventLineup from "./lineup/EventLineup";
import EventVerifyDJs from "./linupVerification/EventVerifyDJs";
import DebuggingDetails from "./DebuggingDetails";
import PreflightChecklist from "./PreflightChecklist";

export const eventRoutes: RouteObject[] = [
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
    path: "preflight",
    element: <PreflightChecklist />,
    handle: { crumb: () => <Link to="preflight">Preflight</Link>}
  },
  {
    path: "announcements",
    element: <EventAnnouncements />,
    handle: { crumb: () => <Link to="announcements">Announcements</Link>},
  },

  {
    path: "debug",
    element: <DebuggingDetails />,
    handle: { crumb: () => <Link to="announcements">Debugging</Link>},
  },
];