import { Breadcrumb, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { breadcrumbRoutes } from '../../breadcrumbRoutes';

const BreadcrumbsBar = () => {
  // @ts-expect-error I dunu, this is exactly how they spell this usage in the docs, but TS is not happy with it.
  const breadcrumbs = useBreadcrumbs(breadcrumbRoutes);

  if (breadcrumbs.length === 1) {
    return null; // No breadcrumbs to display
  }

  return (
    <Container>
      <Breadcrumb>
        {breadcrumbs.map(({ match, breadcrumb }, idx) => (
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: match.pathname }}
            key={match.pathname}
            active={idx >= (breadcrumbs.length - 1)} // wth, why does this have to be backwards?
          >
            {breadcrumb}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </Container>
  );
};

export default BreadcrumbsBar;