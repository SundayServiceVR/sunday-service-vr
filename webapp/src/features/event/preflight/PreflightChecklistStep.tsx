import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChecklistItem } from './types';
import { Event } from '../../../util/types';

interface PreflightChecklistStepProps {
    item: ChecklistItem;
    eventScratchpad: Event;
    onEditMessage: () => void;
    onUploadPoster?: () => void;
}

export const PreflightChecklistStep: React.FC<PreflightChecklistStepProps> = ({
    item,
    eventScratchpad,
    onEditMessage,
    onUploadPoster,
}) => {
    const renderActions = () => {
        if (item.action.type === 'internal') {
            return (
                <Link 
                    to={item.link} 
                    className="btn btn-outline-primary btn-sm"
                >
                    {item.completed ? 'Review' : item.action.label}
                </Link>
            );
        }

        if (item.action.type === 'messaging') {
            const isDiscord = item.action.platform === 'discord';
            return (
                <ButtonGroup>
                    <Button
                        variant={(isDiscord && (!eventScratchpad.message || eventScratchpad.message.trim() === '')) ? 'success' : 'outline-primary'}
                        size="sm"
                        onClick={onEditMessage}
                    >
                        Copy/Edit
                    </Button>
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                    >
                        Open Page
                    </a>
                </ButtonGroup>
            );
        }

        if (item.action.type === 'poster') {
            return (
                <Button
                    variant={!eventScratchpad.lineup_poster_url ? 'success' : 'outline-primary'}
                    size="sm"
                    onClick={onUploadPoster}
                >
                    {eventScratchpad.lineup_poster_url ? 'Change Poster' : 'Upload Poster'}
                </Button>
            );
        }

        if (item.action.type === 'external') {
            return (
                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                >
                    {item.action.label}
                </a>
            );
        }

        return null;
    };

    const getBadgeInfo = () => {
        if (item.optional) {
            return {
                className: 'badge bg-info',
                content: 'i'
            };
        }
        return {
            className: `badge ${item.completed ? 'bg-success' : 'bg-secondary'}`,
            content: item.completed ? '✓' : '○'
        };
    };

    const badge = getBadgeInfo();

    return (
        <div className="d-flex align-items-center mb-3 p-2 border rounded">
            <div className="me-3">
                <span
                    className={badge.className}
                    style={{ fontSize: '1rem', padding: '0.5rem' }}
                >
                    {badge.content}
                </span>
            </div>
            <div className="flex-grow-1">
                <h6 className={`mb-1 ${!item.optional && item.completed ? 'text-success' : !item.optional ? 'text-muted' : ''}`}>
                    {item.label}
                </h6>
                <small className="text-muted">{item.description}</small>
            </div>
            <div className="ms-auto">
                {renderActions()}
            </div>
        </div>
    );
};
