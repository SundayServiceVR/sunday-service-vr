import React from "react";
import { useEventOperations } from "./EventRoot";
import EventSetupBasicDetails from "./EventSetupBasicDetailsForm";
import "react-datepicker/dist/react-datepicker.css";

const EventDetails = () => {

    const [eventScratchpad, proposeEventChange] = useEventOperations();

    return <>
        <h2 className="display-6">Event Setup</h2>
        <EventSetupBasicDetails event={eventScratchpad} onEventChange={proposeEventChange} />
    </>
};

export default EventDetails;
