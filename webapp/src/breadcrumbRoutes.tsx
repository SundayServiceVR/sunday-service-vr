// define custom breadcrumbs for certain routes.

import DjBreadcrumb from "./components/breadcrumbs/DjBreadcrumb";
import EventBreadcrumb from "./components/breadcrumbs/EventBreadcrumb";

// breadcrumbs can be components or strings.
export const breadcrumbRoutes = [
  { path: "/events/:eventId", breadcrumb: EventBreadcrumb },
  { path: "/djs/:djId", breadcrumb: DjBreadcrumb },
];
