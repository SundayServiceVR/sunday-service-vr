import { useState } from "react";
import { Container, Card, Stack } from "react-bootstrap";
import { Dj, Event, EventSignup } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import DjDetails from "./EventSignupDjDetails";
import EventSlotDetails from "./EventSignupDetails";
import { DocumentReference } from "firebase/firestore";
import { AddOrCreateDjModal } from "./components/AddOrCreateDjModal";
import { useEventDjCache } from "../../../contexts/useEventDjCache";

type Props = {
  event: Event,
  onUpdateSignup: (signup: EventSignup) => void,
  onRemoveSignup: (signup: EventSignup) => void,
  onAddSlotToLineup: (signup: EventSignup) => void,
};

const EventSignupList = ({ event, onUpdateSignup, onAddSlotToLineup, onRemoveSignup }: Props) => {

  const { reloadDj } = useEventDjCache();

  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedSignup, setSelectedSignup] = useState<EventSignup | null>(null); // State to track the selected signup

  const isHiddenSubmission = (signup: EventSignup) => {
    if (!signup.dj_refs || signup.dj_refs.length === 0) {
      return false;
    }
    return event.slots.map(slot => slot.signup_uuid).includes(signup.uuid);
  };

  const handleAddDj = async (_: Dj, djRef: DocumentReference) => {
    if (selectedSignup) {
      await reloadDj(djRef.id);
      onUpdateSignup({ ...selectedSignup, dj_refs: [...selectedSignup.dj_refs, djRef] });
    }
    setShowModal(false); // Close the modal after adding
  };

  return (
    <Container className="px-0 pb-3">
      <Stack gap={3}>
        {event.signups.filter((signup) => !isHiddenSubmission(signup)).map(
          (signup) => {
            return (
              <Card key={`signup-${signup.uuid}`}>
                <Card.Header>
                  <Stack direction="horizontal" gap={1}>
                    <div className="lead">
                      {signup.name}
                    </div>
                    <div className="ms-auto"></div>
                    <ActionMenu options={[
                      {
                        label: "Add To Lineup",
                        onClick: () => {
                          onAddSlotToLineup(signup);
                        }
                      },
                      {
                        label: "Add DJ to Slot (B2B)",
                        onClick: () => {
                          setSelectedSignup(signup); // Set the selected signup
                          setShowModal(true); // Show the modal
                        }
                      },
                      {
                        label: "Remove Signup",
                        onClick: () => {
                          onRemoveSignup(signup);
                        }
                      },
                    ]} />
                  </Stack>
                </Card.Header>
                <Card.Body>
                  <EventSlotDetails signup={signup} onUpdateSignup={onUpdateSignup} />
                  <hr />
                  {
                    signup.dj_refs?.map(djRef => (
                      <DjDetails
                        key={djRef.id}
                        djRef={djRef}
                        onRemoveDjRef={(dj_ref) => onUpdateSignup({ ...signup, dj_refs: signup.dj_refs.filter(ref => ref.id !== dj_ref.id) })}
                      />
                    ))
                  }
                </Card.Body>
              </Card>
            );
          }
        )}
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

