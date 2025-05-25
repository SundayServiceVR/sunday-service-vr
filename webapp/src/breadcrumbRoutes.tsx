// define custom breadcrumbs for certain routes.

import DjBreadcrumb from "./components/breadcrumbs/DjBreadcrumb";
import EventBreadcrumb from "./components/breadcrumbs/EventBreadcrumb";

// breadcrumbs can be components or strings.
export const breadcrumbRoutes = [
  { path: "/events/:eventId", breadcrumb: EventBreadcrumb },
  { path: "/events/:eventId/technicalDetails", breadcrumb: () => <>Stream Details</>, },
  { path: "/djs/:djId", breadcrumb: DjBreadcrumb },
];
