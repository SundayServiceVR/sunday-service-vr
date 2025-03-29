import { Container, Form, ListGroup } from "react-bootstrap";
import { useEventOperations } from "../outletContext";
import EventSlotTechnicalDetails from "./EventSlotTechnicalDetails";
import { setEventSlotByIndex } from "../util";
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
    <Form.Group className="mt-2">
      <Form.Label>
        Published
      </Form.Label>
      <Form.Check // prettier-ignore
        type="switch"
        checked={eventScratchpad.published}
        onChange={(formEvent) => { updateEventScratchpad({ ...eventScratchpad, published: formEvent.target.checked }); }}
      />
    </Form.Group>

    <ListGroup>
      {eventScratchpad.slots.map((slot, index) => (
        <ListGroup.Item key={`${eventScratchpad.id}-slot-${index}`}>
          <EventSlotTechnicalDetails 
            index={index} 
            slot={slot} 
            djs={[getDjAssertive(slot.dj_ref.id )]} // Populate DJs from the cache
            onUpdateSlot={(newSlot) => {
              updateEventScratchpad(
                setEventSlotByIndex(eventScratchpad, index, newSlot)
              )
            }}
          />
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Container>
}
export default EventTechnicalDetails;