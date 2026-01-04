import { useEffect, useState } from "react";
import { Button, Container, Nav, Stack } from 'react-bootstrap';
import { default_event } from "../../store/events";
import { docToEvent } from "../../store/converters";
import { onSnapshot, doc } from "firebase/firestore";
import { Event } from "../../util/types";
import { db, storage } from "../../util/firebase";
import FloatingActionBar from "../../components/FloatingActionBar";
import { Outlet, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import { EventPublishedStatusBadge } from "./EventPublishedStatusBadge";
import toast from "react-hot-toast";
import { useEventStore } from "../../hooks/useEventStore/useEventStore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";


const EventRoot = () => {

    const location = useLocation();

    const [event, setEvent] = useState<Event>(default_event);
    const [eventScratchpad, setEventScratchpad] = useState<Event>(event ?? default_event);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    // Tracks the last known Firestore update timestamp we saw for this event
    // so we can tell if a new snapshot represents a truly external change.
    const [lastSeenUpdatedAt, setLastSeenUpdatedAt] = useState<number | null>(null);
    const [lineupPosterFile, setLineupPosterFile] = useState<File | null>(null);
    const [lineupPosterPreviewUrl, setLineupPosterPreviewUrl] = useState<string | null>(null);
    const { eventId } = useParams();

    const { saveEvent, getReconciledEvent} = useEventStore();

    // Listen for changes to the event and reset our actual event when they change.
    useEffect(() => {
        if (!eventId) {
            return;
        }

        return onSnapshot(doc(db, "events", eventId), (doc) => {
            const event = docToEvent(doc);
            if (!event) {
                console.error("Null event returned from current event snapshot listener");
                return;
            }
            setEvent(event);
        });
    }, [eventId]);

    // When a new event comes in, we need to set our scratchpad. If there are
    // active local changes and the Firestore update timestamp moves forward
    // from what we last saw, it's time to yell.
    useEffect(() => {
        if (!event) return;
        const updatedAt = event.lastUpdated?.getTime() ?? null;

        if (hasChanges && lastSeenUpdatedAt !== null && updatedAt !== null && updatedAt > lastSeenUpdatedAt) {
            toast("Changes were made outside of this window.");
        }

        // Treat the latest event from Firestore as the new baseline for the
        // scratchpad and remember its update timestamp.
        setEventScratchpad(event);
        setHasChanges(false);
        setLastSeenUpdatedAt(updatedAt);
        // We do not want a change in "hasChanges" to trigger this useEffect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    // Cleanup: revoke object URL when component unmounts
    useEffect(() => {
        return () => {
            if (lineupPosterPreviewUrl) {
                URL.revokeObjectURL(lineupPosterPreviewUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const proposeEventChange = (event: Event) => {
        let newEvent = { ...event };
        newEvent = getReconciledEvent(newEvent);
        setHasChanges(true);
        setEventScratchpad(newEvent);
    };

    // Called by children when a new lineup poster file is selected on the setup page.
    const onLineupPosterFileSelected = (file: File | null) => {
        // Clean up any existing preview URL to prevent memory leaks
        if (lineupPosterPreviewUrl) {
            URL.revokeObjectURL(lineupPosterPreviewUrl);
            setLineupPosterPreviewUrl(null);
        }

        setLineupPosterFile(file);

        if (!file) {
            // Clear any pending poster changes
            setHasChanges(true);
            setEventScratchpad({
                ...eventScratchpad,
                lineup_poster_path: undefined,
                lineup_poster_url: undefined,
            });
            return;
        }

        // Create a local object URL for preview purposes
        const previewUrl = URL.createObjectURL(file);
        setLineupPosterPreviewUrl(previewUrl);

        // Mark eventScratchpad as changed so the existing save flow sees a difference.
        // Use the local preview URL instead of the marker.
        setHasChanges(true);
        setEventScratchpad({
            ...eventScratchpad,
            lineup_poster_url: previewUrl,
        });
    };

    const onSaveEvent = async () => {
        let uploadedStorageRef: ReturnType<typeof ref> | null = null;
        
        try {
            let eventToSave: Event = { ...eventScratchpad };

            // If a new lineup poster file has been selected, upload it and patch the event
            let storagePath: string | undefined;
            let downloadUrl: string | undefined;

            if (lineupPosterFile && eventId) {
                const safeFileName = lineupPosterFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
                storagePath = `lineup-posters/${eventId}/${Date.now()}_${safeFileName}`;
                const storageRef = ref(storage, storagePath);
                
                await uploadBytes(storageRef, lineupPosterFile);
                uploadedStorageRef = storageRef;
                downloadUrl = await getDownloadURL(storageRef);

                eventToSave = {
                    ...eventToSave,
                    lineup_poster_path: storagePath,
                    lineup_poster_url: downloadUrl,
                };
            }

            // Ensure the event (including lineup poster fields) is fully reconciled
            // before saving so that image-only changes are also persisted.
            eventToSave = getReconciledEvent(eventToSave);

            await saveEvent(eventToSave, event);

            // The event (including lineup poster fields) is now fully persisted via saveEvent.
            setHasChanges(false);
            setLineupPosterFile(null);
            
            // Clean up the preview URL after successful save
            if (lineupPosterPreviewUrl) {
                URL.revokeObjectURL(lineupPosterPreviewUrl);
                setLineupPosterPreviewUrl(null);
            }
        } catch (error) {
            // If we uploaded a file but failed to save the event, clean up the orphaned file
            if (uploadedStorageRef) {
                try {
                    await deleteObject(uploadedStorageRef);
                    console.log('Cleaned up orphaned file after save failure');
                } catch (deleteError) {
                    console.error('Failed to clean up orphaned file:', deleteError);
                }
            }
            
            toast.error(`Error saving event: ${(error as Error).message}`);
        }
    }

    const onCancelChanges = () => {
        setHasChanges(false);
        setLineupPosterFile(null);
        
        // Clean up the preview URL when canceling changes
        if (lineupPosterPreviewUrl) {
            URL.revokeObjectURL(lineupPosterPreviewUrl);
            setLineupPosterPreviewUrl(null);
        }
        
        if (!event) return;
        setEventScratchpad(event);
    }

    return <>

        <Stack direction="horizontal" gap={3}>
            <h2 className="display-4">
                {event.name} ({event.start_datetime.toLocaleDateString()})
            </h2>


            <EventPublishedStatusBadge event={event} />
        </Stack>

        <Nav defaultActiveKey="/events/setup" variant="tabs" as="ul" activeKey={location.pathname}>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/setup`} className="nav-link">Setup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/lineup`} className="nav-link">Lineup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                {/* Verify DJs removed — verification is available via Verify Lineup modal */}
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/announcements`} className="nav-link">Messaging</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/preflight`} className="nav-link">Preflight</Link>
            </Nav.Item>
        </Nav>

        <Container className="mt-3">
            <Outlet context={[eventScratchpad, proposeEventChange, onLineupPosterFileSelected]} />
        </Container>

        <FloatingActionBar hidden={!hasChanges}>
            <Container>
                <Stack direction="horizontal" gap={3} className="justify-content-end">
                    <div className="d-flex align-items-center text-secondary">Save your Changes</div>
                    <Button onClick={onSaveEvent} variant="primary">Save</Button>
                    <Button onClick={onCancelChanges} variant="secondary">Discard</Button>
                </Stack>
            </Container>
        </FloatingActionBar >
    </>
}
export default EventRoot;
