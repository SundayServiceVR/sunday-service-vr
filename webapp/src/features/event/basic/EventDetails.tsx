import { useEventOperations } from "../outletContext";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import "react-datepicker/dist/react-datepicker.css";

const EventDetails = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    return <>
        <h2 className="display-6">Event Setup</h2>
        <EventBasicDetailsForm event={eventScratchpad} onEventChange={proposeEventChange} />
    </>
};

export default EventDetails;
