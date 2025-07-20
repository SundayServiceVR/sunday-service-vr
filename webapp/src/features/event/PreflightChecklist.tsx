import { Container, Card, ButtonGroup, Button, Alert, Stack, Badge } from 'react-bootstrap';
import { useEventOperations } from './outletContext';
import { useEventStore } from '../../hooks/useEventStore/useEventStore';
import toast from 'react-hot-toast';
import { EventPublishedStatusBadge } from './EventPublishedStatusBadge';
import { Link } from 'react-router-dom';

// Add types for checklist items
type RequiredChecklistItem = {
    label: string;
    completed: boolean;
    description: string;
    link: string;
    optional?: false;
};

type OptionalChecklistItem = {
    label: string;
    completed: boolean;
    description: string;
    link: string;
    buttonLabel: string;
    external: true;
    optional: true;
};

type ChecklistItem = RequiredChecklistItem | OptionalChecklistItem;

const PreflightChecklist = () => {
    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const { saveEvent } = useEventStore();

    const handlePublish = async () => {
        try {
            const newEvent = { ...eventScratchpad, published: true };
            await saveEvent(newEvent, eventScratchpad);
            proposeEventChange(newEvent);
            toast.success('Event published successfully!');
        } catch (error) {
            toast.error(`Error publishing event: ${(error as Error).message}`);
        }
    };

    const handleUnpublish = async () => {
        try {
            const newEvent = { ...eventScratchpad, published: false };
            await saveEvent(newEvent, eventScratchpad);
            proposeEventChange(newEvent);
            toast.success('Event unpublished successfully!');
        } catch (error) {
            toast.error(`Error unpublishing event: ${(error as Error).message}`);
        }
    };

    const hasMinimumRequirements = () => {
        return eventScratchpad.name && 
               eventScratchpad.host && 
               eventScratchpad.start_datetime && 
               eventScratchpad.slots.length > 0;
    };

    const getChecklistItems = (): ChecklistItem[] => {
        const required: RequiredChecklistItem[] = [
            {
                label: 'Event Name',
                completed: !!eventScratchpad.name,
                description: 'Event has a name assigned',
                link: `/events/${eventScratchpad.id}/setup`,
                optional: false,
            },
            {
                label: 'Host Assigned',
                completed: !!eventScratchpad.host,
                description: 'Event has a host assigned',
                link: `/events/${eventScratchpad.id}/setup`,
                optional: false,
            },
            {
                label: 'Date & Time Set',
                completed: !!eventScratchpad.start_datetime,
                description: 'Event has a start date and time',
                link: `/events/${eventScratchpad.id}/setup`,
                optional: false,
            },
            {
                label: 'Lineup Created',
                completed: eventScratchpad.slots.length > 0,
                description: `${eventScratchpad.slots.length} slot(s) in lineup`,
                link: `/events/${eventScratchpad.id}/lineup`,
                optional: false,
            },
        ];

        const optional: OptionalChecklistItem[] = [
            {
                label: 'Add the event to vrc.tl',
                completed: false,
                description: 'Share your event on the VRC event listing site.',
                external: true,
                link: 'https://vrc.tl',
                buttonLabel: 'Go to vrc.tl',
                optional: true,
            },
            {
                label: 'Create a post on Bluesky',
                completed: false,
                description: 'Announce your event to the Bluesky community.',
                external: true,
                link: 'https://bsky.app/profile/sundayservice.bsky.social',
                buttonLabel: 'Go to Bluesky',
                optional: true,
            },
            {
                label: 'Update the assets repo',
                completed: false,
                description: 'Update posters and host images in the assets repository.',
                external: true,
                link: 'https://github.com/StrawbsProtato/strawbsprotato.github.io',
                buttonLabel: 'Go to GitHub',
                optional: true,
            },
        ];

        return [...required, ...optional];
    };

    const checklistItems = getChecklistItems();
    const requiredItems = checklistItems.filter(item => !item.optional);
    const optionalItems = checklistItems.filter(item => item.optional);
    const completedCount = requiredItems.filter(item => item.completed).length;
    const totalCount = requiredItems.length;

    return (
        <Container>
            <h1 className="display-6 mb-4">Preflight Checklist</h1>
            
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Event Status</h5>
                    <EventPublishedStatusBadge event={eventScratchpad} />
                </Card.Header>
                <Card.Body>
                    <Stack direction="horizontal" gap={3} className="mb-3">
                        <span className="text-muted">
                            Checklist Progress: {completedCount}/{totalCount} items completed
                        </span>
                        <div className="ms-auto">
                            <Badge 
                                bg={completedCount === totalCount ? 'success' : 'warning'} 
                                pill
                            >
                                {Math.round((completedCount / totalCount) * 100)}% Complete
                            </Badge>
                        </div>
                    </Stack>

                    <div className="progress mb-3">
                        <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            aria-valuenow={completedCount}
                            aria-valuemin={0}
                            aria-valuemax={totalCount}
                        />
                    </div>

                    <h6>Publish/Unpublish Event</h6>
                    <ButtonGroup className="mb-3">
                        <Button 
                            variant={eventScratchpad.published ? 'success' : 'outline-success'}
                            onClick={handlePublish}
                            disabled={!hasMinimumRequirements()}
                        >
                            {eventScratchpad.published ? '✓ Published' : 'Publish Event'}
                        </Button>
                        <Button 
                            variant={!eventScratchpad.published ? 'secondary' : 'outline-secondary'}
                            onClick={handleUnpublish}
                            disabled={!eventScratchpad.published}
                        >
                            {!eventScratchpad.published ? '✓ Unpublished' : 'Unpublish Event'}
                        </Button>
                    </ButtonGroup>

                    {!hasMinimumRequirements() && (
                        <Alert variant="warning" className="mb-3">
                            <Alert.Heading>Requirements Not Met</Alert.Heading>
                            Publishing requires: Event name, host, date/time, and at least one slot in the lineup.
                        </Alert>
                    )}

                    {eventScratchpad.published && (
                        <Alert variant="info" className="mb-0">
                            <Alert.Heading>Event is Live!</Alert.Heading>
                            This event is currently published and visible to the public.
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <h5 className="mb-0">Preflight Checklist</h5>
                </Card.Header>
                <Card.Body>
                    <div className="checklist">
                        {requiredItems.map((item, index) => (
                            <div key={index} className="d-flex align-items-center mb-3 p-2 border rounded">
                                <div className="me-3">
                                    <span 
                                        className={`badge ${item.completed ? 'bg-success' : 'bg-secondary'}`}
                                        style={{ fontSize: '1rem', padding: '0.5rem' }}
                                    >
                                        {item.completed ? '✓' : '○'}
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className={`mb-1 ${item.completed ? 'text-success' : 'text-muted'}`}>
                                        {item.label}
                                    </h6>
                                    <small className="text-muted">{item.description}</small>
                                </div>
                                <div className="ms-auto">
                                    <Link 
                                        to={item.link} 
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        {item.completed ? 'Review' : 'Complete'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            <Card className="mt-4">
                <Card.Header>
                    <h6 className="mb-0">Additional Steps (Optional)</h6>
                </Card.Header>
                <Card.Body>
                    <div className="checklist">
                        {optionalItems.map((item, index) => (
                            <div key={index} className="d-flex align-items-center mb-3 p-2 border rounded bg-light">
                                <div className="me-3">
                                    <span
                                        className="badge bg-info"
                                        style={{ fontSize: '1rem', padding: '0.5rem' }}
                                    >
                                        i
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 text-muted">
                                        {item.label}
                                    </h6>
                                    <small className="text-muted">{item.description}</small>
                                </div>
                                <div className="ms-auto">
                                    {'buttonLabel' in item && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            {item.buttonLabel}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PreflightChecklist;