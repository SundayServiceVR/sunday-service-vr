import { useState } from "react";
import { Container, Stack } from "react-bootstrap";
import { Dj, Event, EventSignup } from "../../../util/types";
import { AddOrCreateDjModal } from "./components/AddOrCreateDjModal";
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import EventSignupEntry from "./EventSignupEntry";
import { DocumentReference } from "firebase/firestore";

type Props = {
  event: Event;
  onUpdateSignup: (signup: EventSignup) => void;
  onRemoveSignup: (signup: EventSignup) => void;
  onAddSlotToLineup: (signup: EventSignup) => void;
};

const EventSignupList = ({
  event,
  onUpdateSignup,
  onAddSlotToLineup,
  onRemoveSignup,
}: Props) => {
  const { reloadDj } = useEventDjCache();

  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedSignup, setSelectedSignup] = useState<EventSignup | null>(null); // State to track the selected signup

  const isHiddenSubmission = (signup: EventSignup) => {
    if (!signup.dj_refs || signup.dj_refs.length === 0) {
      return false;
    }
    return event.slots.map((slot) => slot.signup_uuid).includes(signup.uuid);
  };

  const handleAddDj = async (_: Dj, djRef: DocumentReference) => {
    if (selectedSignup) {
      await reloadDj(djRef.id);
      onUpdateSignup({
        ...selectedSignup,
        dj_refs: [...selectedSignup.dj_refs, djRef],
      });
    }
    setShowModal(false); // Close the modal after adding
  };

  return (
    <Container className="px-0 pb-3">
      <Stack gap={3}>
        {event.signups
          .filter((signup) => !isHiddenSubmission(signup))
          .map((signup) => (
            <EventSignupEntry
              key={signup.uuid}
              signup={signup}
              onAddSlotToLineup={onAddSlotToLineup}
              onRemoveSignup={onRemoveSignup}
              onUpdateSignup={onUpdateSignup}
              setSelectedSignup={setSelectedSignup}
              setShowModal={setShowModal}
            />
          ))}
      </Stack>

      {/* AddOrCreateDjModal */}
      {showModal && selectedSignup && (
        <AddOrCreateDjModal
          show={showModal}
          handleClose={() => setShowModal(false)} // Close the modal
          onDjSelected={handleAddDj} // Handle adding a DJ
        />
      )}
    </Container>
  );
};

export { EventSignupList as EventDjSignups };

