import { Col, Container, ListGroup, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import DjAvatarList from "./DjAvatarList";
import { Dj, Event } from "../util/types";
import { DocumentReference } from "firebase/firestore";

type DjDetailsProps = {
  dj: Dj;
  djRef?: DocumentReference; // Make djRef optional
  djEvents: Event[];
};

const DjDetails = ({ dj, djRef, djEvents }: DjDetailsProps) => {
  return (
    <Container className="mt-3 mb-3">
      <Row className="mb-2">
        <Col>
          <h5 className="mb-0 pb-2 border-bottom d-flex align-items-center">
            <DjAvatarList djRefs={djRef ? [djRef] : []} />
            <span className="px-2">{dj.dj_name}</span>
          </h5>
        </Col>
      </Row>
      <Row>
        <Col>
          <Stack direction="horizontal">
            <span>Other Events ({djEvents.length ?? "?"} total)</span>
          </Stack>
          <ListGroup>
            {djEvents
              ?.sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
              .slice(0, 3)
              .map((event, index) => {
                if (!event) {
                  return (
                    <ListGroup.Item key={index} className="px-3 py-1">
                      Unknown Event
                    </ListGroup.Item>
                  );
                }
                return (
                  <ListGroup.Item key={index} className="px-3 py-1">
                    <Link to={`/events/${event.id}/lineup`} target="blank">
                      {event.name} ({event.start_datetime.toLocaleDateString()})
                    </Link>
                  </ListGroup.Item>
                );
              })}
          </ListGroup>
          {djEvents.length > 3 && (
            <div className="mt-2">
              <Link to={`/djs/${djRef?.id}`} target="_blank">
                See all
              </Link>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DjDetails;
