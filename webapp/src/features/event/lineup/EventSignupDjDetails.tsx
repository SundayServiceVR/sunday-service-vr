import { Container, Spinner } from "react-bootstrap";
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import { Dj, Event } from "../../../util/types";
import { useEffect, useState } from "react";
import { DocumentReference } from "firebase/firestore";
import DjDetails from "../../../components/DjDetails";

type Props = {
  djRef: DocumentReference;
};

const EventSignupDjDetails = ({ djRef }: Props) => {
  const { loading, getEventsByDjId, djCache } = useEventDjCache();
  const [djEvents, setDjEvents] = useState<Event[]>([]);
  const [dj, setDj] = useState<Dj>();

  useEffect(() => {
    const dj = djCache.get(djRef.id);
    setDj(dj);

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

  return <DjDetails dj={dj} djRef={djRef} djEvents={djEvents} />;
};

export default EventSignupDjDetails;