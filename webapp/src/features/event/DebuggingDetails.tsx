import { useParams } from "react-router-dom";
import { useEventDjCache } from "../../contexts/useEventDjCache";

const DebuggingDetails = () => {
    const { eventId } = useParams();
    const { eventCache } = useEventDjCache();
    
    if(!eventId) {
      throw new Error("No Event Id Found");
    }

    const eventData = eventCache.get(eventId);

    if(!eventData) {
      <div>No event found</div>
    }

    return (
        <div>
            <h1>Debugging Details</h1>
            <pre>{JSON.stringify(eventData, null, 2)}</pre>
        </div>
    );
};

export default DebuggingDetails;
