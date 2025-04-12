import { Container, ListGroup } from "react-bootstrap";
import { useEventOperations } from "../outletContext";
import EventSlotStreamDetails from "./EventSlotStreamDetails";
import { setEventSlotByIndex, updateSignupForEvent } from "../util";

const EventStreamDetails = () => {
  const [eventScratchpad, updateEventScratchpad] = useEventOperations();
  return <Container>
    <h1 className="display-6">Stream Details</h1>
    <ListGroup>
      {eventScratchpad.slots.map((slot, index) => (
        <ListGroup.Item key={`${eventScratchpad.id}-slot-${index}`}>
          <EventSlotStreamDetails 
            index={index} 
            slot={slot}
            event={eventScratchpad}
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