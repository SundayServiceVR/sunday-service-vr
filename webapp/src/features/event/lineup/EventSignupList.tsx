import { useState } from "react";
import { Container, Stack, ButtonGroup, Button } from "react-bootstrap";
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
  const { reloadDj, getEventsByDjId } = useEventDjCache();

  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedSignup, setSelectedSignup] = useState<EventSignup | null>(null); // State to track the selected signup
  const [sortBy, setSortBy] = useState<"default" | "recent">("default"); // State to track sorting

  const isHiddenSubmission = (signup: EventSignup) => {
    if (!signup.dj_refs || signup.dj_refs.length === 0) {
      return false;
    }
    return event.slots.map((slot) => slot.signup_uuid).includes(signup.uuid);
  };

  // Function to get the most recent play date for a signup
  const getMostRecentPlayDate = (signup: EventSignup): Date => {
    if (!signup.dj_refs || signup.dj_refs.length === 0) {
      return new Date(0); // Very old date for DJs with no refs
    }

    // Get all events for all DJs in this signup
    const allDjEvents = signup.dj_refs.flatMap(djRef => {
      const djEvents = getEventsByDjId(djRef.id);
      return djEvents || [];
    });

    if (allDjEvents.length === 0) {
      return new Date(0); // Very old date for DJs with no plays
    }

    // Find the most recent play (earliest date among the "most recent" for each DJ)
    const mostRecentDates = signup.dj_refs.map(djRef => {
      const djEvents = getEventsByDjId(djRef.id);
      if (!djEvents || djEvents.length === 0) {
        return new Date(0);
      }
      // Get the most recent event for this DJ
      return djEvents
        .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())[0]
        .start_datetime;
    });

    // Return the earliest among the most recent dates (DJ who played earliest gets priority)
    return new Date(Math.min(...mostRecentDates.map(date => date.getTime())));
  };

  // Sort signups based on selected sorting method
  const sortedSignups = [...event.signups]
    .filter((signup) => !isHiddenSubmission(signup))
    .sort((a, b) => {
      if (sortBy === "recent") {
        const dateA = getMostRecentPlayDate(a);
        const dateB = getMostRecentPlayDate(b);
        return dateA.getTime() - dateB.getTime(); // Oldest first (longest time since last play)
      }
      return 0; // Default order
    });

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
      {/* Sorting Controls */}
      <div className="mb-3">
        <small className="text-muted d-block mb-2">Sort by:</small>
        <ButtonGroup size="sm">
          <Button 
            variant={sortBy === "default" ? "primary" : "outline-primary"}
            onClick={() => setSortBy("default")}
          >
            Signup Order
          </Button>
          <Button 
            variant={sortBy === "recent" ? "primary" : "outline-primary"}
            onClick={() => setSortBy("recent")}
          >
            Longest Since Last Play
          </Button>
        </ButtonGroup>
      </div>

      <Stack gap={3}>
        {sortedSignups.map((signup) => (
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

