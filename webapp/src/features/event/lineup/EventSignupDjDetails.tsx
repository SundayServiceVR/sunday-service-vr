import { Container, Spinner } from "react-bootstrap";
import { DocumentReference } from "firebase/firestore";
import { useDjWithEvents } from "../../../contexts/useEventDjCache/useDjWithEvents";
import DjDetails from "../../../components/DjDetails";

type Props = {
  djRef: DocumentReference;
};

const EventSignupDjDetails = ({ djRef }: Props) => {
  const { dj, events: djEvents, loading } = useDjWithEvents(djRef.id);

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