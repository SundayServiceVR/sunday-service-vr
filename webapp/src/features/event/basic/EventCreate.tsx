import { FormEvent, useState } from "react";
import { createEvent, default_event } from "../../../store/events";
import { Event } from "../../../util/types";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import { Breadcrumb, Button, Form, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Spinner from "../../../components/spinner";

const EventCreate = () => {
    const [ event, setEvent ] = useState<Event>({ ...default_event });
    const [ busy, setBusy ] = useState<boolean>(false);
    const navigate = useNavigate();

    const onCreateEvent = (formEvent: FormEvent) => {
        formEvent.preventDefault();
        (async () => {
            setBusy(true);
            event.end_datetime = event.start_datetime;
            const result = await createEvent(event);
            navigate(`/events/${result.id}`)
        })();
    }

    if(busy) {
        return <Spinner type="logo" />
    }

    return <section>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item href="/events" className="nav-link">Events</Breadcrumb.Item>
            <Breadcrumb.Item href={`/events/${event.id}`} className="nav-link">{event.id}</Breadcrumb.Item>
        </Breadcrumb>
        <h2 className="display-5">Create Event</h2>
        <Form onSubmit={(evt) => onCreateEvent(evt)}>
            <EventBasicDetailsForm event={event} onEventChange={setEvent} />
            <Stack direction="horizontal" gap={3} className="p-3">
                <span className="me-auto" />
                <Button type="submit" variant="primary">Create Event</Button>
            </Stack>
        </Form>
    </section>
}

export default EventCreate;