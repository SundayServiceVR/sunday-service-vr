import { useEffect, useRef, useState } from "react";
import { Button, Container, Nav, Stack } from 'react-bootstrap';
import { default_event } from "../../store/events";
import { docToEvent } from "../../store/converters";
import { onSnapshot, doc } from "firebase/firestore";
import { Event } from "../../util/types";
import { db, storage } from "../../util/firebase";
import FloatingActionBar from "../../components/FloatingActionBar";
import { Outlet, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useEventStore } from "../../hooks/useEventStore/useEventStore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAutosave } from "../../hooks/useAutosave/useAutosave";
import { useAutosavePreference } from "../../hooks/useAutosave/useAutosavePreference";
import { decideIncomingEvent } from "./eventSync";
import SaveStatus from "./SaveStatus";

const AUTOSAVE_DELAY_MS = 200;

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

    // Identifies this tab as the author of a save, so we can recognise our own
    // writes when they echo back from Firestore.
    const [sessionId] = useState(() => crypto.randomUUID());
    // Bumped on every local edit so a finishing save can tell whether the user
    // kept typing while it was in flight.
    const [editVersion, setEditVersion] = useState(0);
    const editVersionRef = useRef(0);
    const [autosaveEnabled] = useAutosavePreference();

    const markEdited = () => {
        editVersionRef.current += 1;
        setEditVersion(editVersionRef.current);
        setHasChanges(true);
    };

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

        const decision = decideIncomingEvent({
            hasLocalChanges: hasChanges,
            incomingSavedBy: event.lastSavedBy,
            localSessionId: sessionId,
            incomingUpdatedAt: updatedAt,
            lastSeenUpdatedAt,
        });

        if (decision.notifyExternalChange) {
            toast("Changes were made outside of this window.");
        }

        // `event` is always the new baseline; the scratchpad only follows it
        // when that won't discard edits the user hasn't saved yet.
        if (decision.adoptIntoScratchpad) {
            setEventScratchpad(event);
            setHasChanges(false);
        }
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
        markEdited();
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
            markEdited();
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
        markEdited();
        setEventScratchpad({
            ...eventScratchpad,
            lineup_poster_url: previewUrl,
        });
    };

    /** Persists the scratchpad. Throws on failure; callers decide how to report it. */
    const persistEvent = async () => {
        let uploadedStorageRef: ReturnType<typeof ref> | null = null;
        const versionAtStart = editVersionRef.current;
        
        try {
            let eventToSave: Event = { ...eventScratchpad, lastSavedBy: sessionId };

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

            // Only mark clean if the user didn't keep editing while we saved;
            // otherwise their newer edits still need saving.
            if (editVersionRef.current === versionAtStart) {
                setHasChanges(false);
                setEventScratchpad(eventToSave);
                setLineupPosterFile(null);

                if (lineupPosterPreviewUrl) {
                    URL.revokeObjectURL(lineupPosterPreviewUrl);
                    setLineupPosterPreviewUrl(null);
                }
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
            
            throw error;
        }
    }

    const onSaveEvent = async () => {
        try {
            await persistEvent();
        } catch (error) {
            toast.error(`Error saving event: ${(error as Error).message}`);
        }
    };

    const { status: autosaveStatus, flush: flushAutosave, retry: retryAutosave } = useAutosave({
        enabled: autosaveEnabled,
        isDirty: hasChanges,
        canSave: !!eventScratchpad.name?.trim(),
        version: editVersion,
        save: persistEvent,
        delayMs: AUTOSAVE_DELAY_MS,
    });

    // Don't let a tab close silently drop edits that haven't been saved yet.
    useEffect(() => {
        if (!hasChanges) return;
        const warn = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [hasChanges]);

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
        </Stack>

        <Nav defaultActiveKey="/events/setup" variant="tabs" as="ul" activeKey={location.pathname}>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/setup`} className="nav-link">Setup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/lineup`} className="nav-link">Lineup</Link>
            </Nav.Item>
            <Nav.Item as="li">
                <Link to={`/events/${event.id}/preflight`} className="nav-link">Preflight</Link>
            </Nav.Item>
        </Nav>

        <Container className="mt-3" onBlurCapture={flushAutosave}>
            <Outlet context={[eventScratchpad, proposeEventChange, onLineupPosterFileSelected]} />
        </Container>

        <FloatingActionBar hidden={autosaveEnabled ? autosaveStatus === "idle" : !hasChanges}>
            <Container>
                {autosaveEnabled ? (
                    <SaveStatus status={autosaveStatus} onRetry={retryAutosave} />
                ) : (
                    <Stack direction="horizontal" gap={3} className="justify-content-end">
                        <div className="d-flex align-items-center text-secondary">Save your Changes</div>
                        <Button onClick={onSaveEvent} variant="primary">Save</Button>
                        <Button onClick={onCancelChanges} variant="secondary">Discard</Button>
                    </Stack>
                )}
            </Container>
        </FloatingActionBar >
    </>
}
export default EventRoot;
