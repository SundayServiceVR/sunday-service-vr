import { FormEvent, useState } from "react";
import { default_event } from "../../../store/events";
import { Event } from "../../../util/types";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import { Breadcrumb, Button, Form, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Spinner from "../../../components/spinner/Spinner";
import { useEventStore } from "../../../hooks/useEventStore/useEventStore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../util/firebase";

const EventCreate = () => {
    const [ event, setEvent ] = useState<Event>({ ...default_event });
    const [ lineupPosterFile, setLineupPosterFile ] = useState<File | null>(null);
    const [ busy, setBusy ] = useState<boolean>(false);
    const navigate = useNavigate();

    const { createEvent, saveEvent } = useEventStore();

    const onCreateEvent = (formEvent: FormEvent) => {
        formEvent.preventDefault();
        (async () => {
            setBusy(true);
            try {
                event.end_datetime = event.start_datetime;

                // First create the event without the lineup poster so we get an ID
                const createdRef = await createEvent(event);

                // If a lineup poster has been selected, upload it and patch the event
                if (lineupPosterFile && createdRef.id) {
                    const safeFileName = lineupPosterFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
                    const storagePath = `lineup-posters/${createdRef.id}/${Date.now()}_${safeFileName}`;
                    const storageRef = ref(storage, storagePath);
                    await uploadBytes(storageRef, lineupPosterFile);
                    const downloadUrl = await getDownloadURL(storageRef);

                    const eventWithPoster: Event = {
                        ...event,
                        id: createdRef.id,
                        lineup_poster_path: storagePath,
                        lineup_poster_url: downloadUrl,
                    };

                    await saveEvent(eventWithPoster, undefined);

                }

                const result = { id: createdRef.id };
                navigate(`/events/${result.id}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to create event";
                toast.error(errorMessage);
            } finally {
                setBusy(false);
            }
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
            <EventBasicDetailsForm
                event={event}
                onEventChange={setEvent}
                onLineupPosterFileChange={setLineupPosterFile}
            />
            <Stack direction="horizontal" gap={3} className="p-3">
                <span className="me-auto" />
                <Button type="submit" variant="primary">Create Event</Button>
            </Stack>
        </Form>
    </section>
}

export default EventCreate;