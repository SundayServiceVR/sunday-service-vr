import React from 'react';
import { Accordion, ButtonGroup, Button } from 'react-bootstrap';

interface OutdatedStepsAccordionProps {
    onShowSocialMediaModal: () => void;
}

export const OutdatedStepsAccordion: React.FC<OutdatedStepsAccordionProps> = ({
    onShowSocialMediaModal,
}) => {
    const outdatedItems = [
        {
            label: 'Add event to vrc.tl',
            description: 'Share your event on the VRCTL event listing site.',
            link: 'https://vrc.tl',
            buttonLabel: 'Go to vrc.tl',
            isMessaging: false,
        },
        {
            label: 'Social Media Announcement',
            description: 'Share your event on Bluesky and other platforms.',
            link: 'https://bsky.app/profile/sundayservice.bsky.social',
            buttonLabel: 'Go to Bluesky',
            isMessaging: true,
        },
        {
            label: 'Update the assets repo',
            description: 'Update posters and host images in the assets repository.',
            link: 'https://github.com/StrawbsProtato/strawbsprotato.github.io',
            buttonLabel: 'Go to GitHub',
            isMessaging: false,
        },
    ];

    return (
        <Accordion className="mt-4">
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <h6 className="mb-0 text-muted">Outdated Steps (No Longer Used)</h6>
                </Accordion.Header>
                <Accordion.Body>
                    <div className="checklist">
                        {outdatedItems.map((item, index) => (
                            <div key={index} className="d-flex align-items-center mb-3 p-2 border rounded bg-light">
                                <div className="me-3">
                                    <span
                                        className="badge bg-secondary"
                                        style={{ fontSize: '1rem', padding: '0.5rem' }}
                                    >
                                        ✕
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 text-muted text-decoration-line-through">
                                        {item.label}
                                    </h6>
                                    <small className="text-muted">{item.description}</small>
                                </div>
                                <div className="ms-auto">
                                    {item.isMessaging ? (
                                        <ButtonGroup>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={onShowSocialMediaModal}
                                            >
                                                Preview
                                            </Button>
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-secondary btn-sm"
                                            >
                                                {item.buttonLabel}
                                            </a>
                                        </ButtonGroup>
                                    ) : (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-secondary btn-sm"
                                        >
                                            {item.buttonLabel}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};
