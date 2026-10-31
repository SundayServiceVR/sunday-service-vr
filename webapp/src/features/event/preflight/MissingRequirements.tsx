import React from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Event } from '../../../util/types';
import { HostSearchSelect } from '../../host/HostSearchSelect';
import { getMissingRequirements } from './getMissingRequirements';

interface Props {
    event: Event;
    onEventChange: (event: Event) => void;
}

const toLocalInput = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);

export const MissingRequirements: React.FC<Props> = ({ event, onEventChange }) => {
    const missing = getMissingRequirements(event);
    if (missing.length === 0) return null;

    return (
        <Alert variant="warning" className="mb-0" data-testid="missing-requirements">
            <Alert.Heading>Requirements Not Met</Alert.Heading>
            <p>Updating the board requires the following to be filled in:</p>

            {missing.includes('Name') && (
                <Form.Group className="mb-3" data-testid="missing-name">
                    <Form.Label>Event name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Sunday Service"
                        value={event.name ?? ''}
                        onChange={(e) => onEventChange({ ...event, name: e.target.value })}
                    />
                </Form.Group>
            )}

            {missing.includes('Host') && (
                <div data-testid="missing-host">
                    <HostSearchSelect
                        selectedHostRef={event.host_ref}
                        onHostSelect={(host, hostRef) =>
                            onEventChange({ ...event, host: host?.host_name ?? '', host_ref: hostRef ?? undefined })
                        }
                    />
                </div>
            )}

            {missing.includes('Date') && (
                <Form.Group className="mb-3" data-testid="missing-date">
                    <Form.Label>Date/Time (Local)</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={event.start_datetime && !isNaN(event.start_datetime.getTime()) ? toLocalInput(event.start_datetime) : ''}
                        onChange={(e) => {
                            const ms = Date.parse(e.target.value);
                            if (!isNaN(ms)) onEventChange({ ...event, start_datetime: new Date(ms) });
                        }}
                    />
                </Form.Group>
            )}

            {missing.includes('Lineup') && (
                <div data-testid="missing-lineup">
                    At least one slot in the lineup. <Link to={`/events/${event.id}/lineup`}>Edit lineup</Link>
                </div>
            )}
        </Alert>
    );
};
