import { Container, ListGroup } from "react-bootstrap";
import { useEventOperations } from "../outletContext";
import EventSlotTechnicalDetails from "./EventSlotTechnicalDetails";
import { setEventSlotByIndex, updateSignupForEvent } from "../util";
import { useEventDjCache } from "../../../contexts/useEventDjCache";

const EventTechnicalDetails = () => {
  const [eventScratchpad, updateEventScratchpad] = useEventOperations();
  const eventDjCache = useEventDjCache();



  // Method to assertively get a DJ by ID
  const getDjAssertive = (djId: string) => {
    const dj = eventDjCache.djCache.get(djId);
    if (!dj) {
      throw new Error(`DJ with ID ${djId} not found in eventDjCache.`);
    }
    return dj;
  };

  return <Container>
    <h1 className="display-6">Stream Details</h1>
    <ListGroup>
      {eventScratchpad.slots.map((slot, index) => (
        <ListGroup.Item key={`${eventScratchpad.id}-slot-${index}`}>
          <EventSlotTechnicalDetails 
            index={index} 
            slot={slot}
            event={eventScratchpad}
            djs={[getDjAssertive(slot.dj_ref.id )]} // Populate DJs from the cache
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
export default EventTechnicalDetails;