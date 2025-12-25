import { Link, RouteObject } from "react-router-dom";
import EventDetails from "./basic/EventDetails";
import EventLineup from "./lineup/EventLineup";
import DebuggingDetails from "./DebuggingDetails";
import PreflightChecklist from "./preflight/PreflightChecklist";

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
  // "Verify DJs" route removed; functionality accessible from the Lineup UI modal.
  {
    path: "preflight",
    element: <PreflightChecklist />,
    handle: { crumb: () => <Link to="preflight">Preflight</Link>}
  },

  {
    path: "debug",
    element: <DebuggingDetails />,
    handle: { crumb: () => <Link to="debug">Debugging</Link>},
  },
];