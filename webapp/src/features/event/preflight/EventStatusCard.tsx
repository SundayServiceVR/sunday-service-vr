import React from 'react';
import { Card, ButtonGroup, Button, Alert, Stack, Badge } from 'react-bootstrap';
import { EventPublishedStatusBadge } from '../EventPublishedStatusBadge';
import { Event } from '../../../util/types';

interface EventStatusCardProps {
    event: Event;
    completedCount: number;
    totalCount: number;
    hasMinimumRequirements: boolean;
    onPublish: () => void;
    onUnpublish: () => void;
}

export const EventStatusCard: React.FC<EventStatusCardProps> = ({
    event,
    completedCount,
    totalCount,
    hasMinimumRequirements,
    onPublish,
    onUnpublish,
}) => {
    return (
        <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Event Status</h5>
                <EventPublishedStatusBadge event={event} />
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
                        variant={event.published ? 'success' : 'outline-success'}
                        onClick={onPublish}
                        disabled={!hasMinimumRequirements}
                    >
                        {event.published ? '✓ Published' : 'Publish Event'}
                    </Button>
                    <Button 
                        variant={!event.published ? 'secondary' : 'outline-secondary'}
                        onClick={onUnpublish}
                        disabled={!event.published}
                    >
                        {!event.published ? '✓ Unpublished' : 'Unpublish Event'}
                    </Button>
                </ButtonGroup>

                {!hasMinimumRequirements && (
                    <Alert variant="warning" className="mb-3">
                        <Alert.Heading>Requirements Not Met</Alert.Heading>
                        Publishing requires: Event name, host, date/time, and at least one slot in the lineup.
                    </Alert>
                )}

                {event.published && (
                    <Alert variant="info" className="mb-0">
                        <Alert.Heading>Event is Live!</Alert.Heading>
                        This event is currently published and visible to the public.
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};
