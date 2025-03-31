import { Col, Container, Dropdown, ListGroup, Row, Spinner, Stack } from "react-bootstrap";
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import { Dj, Event } from "../../../util/types";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DocumentReference } from "firebase/firestore";
import { Disc } from "react-feather"; // Import the Settings icon from react-feather

type Props = {
  djRef: DocumentReference;
  onRemoveDjRef: (djRef: DocumentReference) => void;
};

const DjDetails = ({ djRef, onRemoveDjRef }: Props) => {
  const { loading, getEventsByDjId, djCache } = useEventDjCache();
  const [djEvents, setDjEvents] = useState<Event[]>([]);
  const [dj, setDj] = useState<Dj>();

  useEffect(() => {
    const inDj = djRef && djCache.get(djRef.id);
    setDj(inDj);

    const events = getEventsByDjId(djRef.id);
    setDjEvents(events);
  }, [djCache, djRef, getEventsByDjId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-around">
        <Spinner />
      </Container>
    );
  }

  if (!dj) {
    return <p>No Dj Found</p>;
  }

  return (
    <Container className="mt-3">
      <Row>
        <Col>
          <h5>{dj.dj_name}</h5>
        </Col>
        <Col className="text-end">
          <Dropdown>
            <Dropdown.Toggle variant="white" id="dropdown-basic" size="sm">
              <Disc size={16} /> {/* Use the Settings icon */}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to={`/djs/${djRef.id}`} target="_blank">
                Edit {dj.dj_name} DJ Info
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onRemoveDjRef(djRef)}>
                Remove { dj.dj_name } from signup slot
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
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
              <Link to={`/djs/${djRef.id}`} target="_blank">
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