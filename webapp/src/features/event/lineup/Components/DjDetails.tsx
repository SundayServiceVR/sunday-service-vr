import { Col, Container, ListGroup, Row, Spinner, Stack } from "react-bootstrap"
import { useEventDjCache } from "../../../../contexts/eventDjCacheProvider";
import { Dj } from "../../../../util/types";
import { Link } from "react-router-dom";


type Props = {
  dj: Dj;
}

const DjDetails = ({ dj }: Props) => {

  const { eventCache, loading } = useEventDjCache();

  if (loading) {
    return <Container className="d-flex justify-content-around">
      <Spinner />
    </Container>
  }

  return <Container>
    <Row>
      <Col>
        <p>Dj Name: {dj.dj_name}</p>
        {/* <div>
          Notes:
          <ul>
            {dj.notes?.map((note, index) => <li key={`dj-note-${index}`}>{note}</li>)}
          </ul>
        </div> */}
      </Col>
      <Col>
        <Stack direction="horizontal">
          <span>Other Events ({dj?.events?.length ?? "?"} total)</span>
        </Stack>
        <ListGroup>
          {dj.events?.map((eventRef) => {
            const event = eventCache.get(eventRef.id);
            if(!event) {
              return <ListGroup.Item key={eventRef.id} className="px-3 py-1">
                Unknown Event
              </ListGroup.Item>
            }
            return <ListGroup.Item key={eventRef.id} className="px-3 py-1">
              <Link to={`/events/${event.id}/lineup`} target="blank">{event.name} ({event.start_datetime.toLocaleDateString()})</Link>
            </ListGroup.Item>
          }
          )}

        </ListGroup>
      </Col>
    </Row>
  </Container>
}

export default DjDetails;