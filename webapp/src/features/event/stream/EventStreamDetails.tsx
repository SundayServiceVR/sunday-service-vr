import { Container, ListGroup } from "react-bootstrap";
import { useEventOperations } from "../outletContext";
import EventSlotStreamDetails from "./EventSlotStreamDetails";
import { setEventSlotByIndex, updateSignupForEvent } from "../util";
import { useEventDjCache } from "../../../contexts/useEventDjCache";

const EventStreamDetails = () => {
  const [eventScratchpad, updateEventScratchpad] = useEventOperations();
  const { getDjsForSlot } = useEventDjCache();

  return <Container>
    <h1 className="display-6">Stream Details</h1>
    <ListGroup>
      {eventScratchpad.slots.map((slot, index) => (
        <ListGroup.Item key={`${eventScratchpad.id}-slot-${index}`}>
          <EventSlotStreamDetails 
            index={index} 
            slot={slot}
            event={eventScratchpad}
            djs={getDjsForSlot(eventScratchpad, slot)} // Populate DJs from the cache
            onUpdateSlot={(newSlot) => {
              updateEventScratchpad(
                setEventSlotByIndex(eventScratchpad, index, newSlot)
              )
            }}
            onUpdateSignup={(signup) => {
              updateEventScratchpad(
                updateSignupForEvent(eventScratchpad, signup)
              )
            }}
          />
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Container>
}
export default EventStreamDetails;