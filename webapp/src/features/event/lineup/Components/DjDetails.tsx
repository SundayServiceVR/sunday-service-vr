import { Col, Container, ListGroup, Row, Spinner, Stack } from "react-bootstrap"
import { useEventDjCache } from "../../../../contexts/eventDjCacheProvider";
import { Dj, Event } from "../../../../util/types";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DocumentReference } from "firebase/firestore";


type Props = {
  dj: Dj;
  djRef: DocumentReference
}

const DjDetails = ({ dj, djRef }: Props) => {
  const { loading, getEventsByDjId } = useEventDjCache();
  const [djEvents, setDjEvents] = useState<Event[]>([]);

  useEffect(() => {
    const events = getEventsByDjId(djRef.id);
    setDjEvents(events);
  }, [djRef, getEventsByDjId]);

  if (loading) {
    return <Container className="d-flex justify-content-around">
      <Spinner />
    </Container>
  }

  return <Container>
    <Row>
      <Col>
        <p>Dj Name: {dj.dj_name}</p>
      </Col>
      <Col>
        <Stack direction="horizontal">
          <span>Other Events ({djEvents.length ?? "?"} total)</span>
        </Stack>
        <ListGroup>
          {djEvents?.map((event, index) => {
            if (!event) {
              return <ListGroup.Item key={index} className="px-3 py-1">
                Unknown Event
              </ListGroup.Item>
            }
            return <ListGroup.Item key={index} className="px-3 py-1">
              <Link to={`/events/${event.id}/lineup`} target="blank">{event.name} ({event.start_datetime.toLocaleDateString()})</Link>
            </ListGroup.Item>
          })}
        </ListGroup>
      </Col>
    </Row>
  </Container>
}

export default DjDetails;