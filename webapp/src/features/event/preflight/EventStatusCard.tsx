import React from 'react';
import { Card, Button, Alert, Stack, Badge } from 'react-bootstrap';

interface EventStatusCardProps {
    completedCount: number;
    totalCount: number;
    hasMinimumRequirements: boolean;
    onUpdateBoard: () => void;
    onClearBoard: () => void;
    onViewBoard: () => void;
    updatingBoard: boolean;
}

export const EventStatusCard: React.FC<EventStatusCardProps> = ({
    completedCount,
    totalCount,
    hasMinimumRequirements,
    onUpdateBoard,
    onClearBoard,
    onViewBoard,
    updatingBoard,
}) => {
    return (
        <Card className="mb-4">
            <Card.Header>
                <h5 className="mb-0">Event Status</h5>
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

                <h6>In-world Whiteboard</h6>
                <p className="text-muted">
                    Pushes this event's lineup and posters to the whiteboard. Saves the event first.
                </p>
                <Stack direction="horizontal" gap={2} className="mb-3">
                    <Button
                        variant="primary"
                        onClick={onUpdateBoard}
                        disabled={!hasMinimumRequirements || updatingBoard}
                    >
                        {updatingBoard ? 'Working...' : 'Update board'}
                    </Button>
                    <Button variant="outline-danger" onClick={onClearBoard} disabled={updatingBoard}>
                        Clear board
                    </Button>
                    <Button variant="outline-secondary" onClick={onViewBoard}>
                        View current board
                    </Button>
                </Stack>

                {!hasMinimumRequirements && (
                    <Alert variant="warning" className="mb-0">
                        <Alert.Heading>Requirements Not Met</Alert.Heading>
                        Updating the board requires: Event name, host, date/time, and at least one slot in the lineup.
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};
