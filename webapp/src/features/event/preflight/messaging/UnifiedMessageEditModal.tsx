import React from 'react';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { Event } from '../../../../util/types';

type MessageType = 'discord' | 'social';

type UnifiedMessageEditModalProps = {
    show: boolean;
    onHide: () => void;
    event: Event;
    onSave: (updatedMessage: string) => void | Promise<void>;
    messageType: MessageType;
    getMessageFromEvent: (event: Event) => string;
    generatePreview?: (event: Event, message: string) => string;
    title: string;
    label: string;
    helpText: string;
    previewLabel?: string;
    previewHelpText?: string;
};

const UnifiedMessageEditModal = ({
    show,
    onHide,
    event,
    onSave,
    messageType,
    getMessageFromEvent,
    generatePreview,
    title,
    label,
    helpText,
    previewLabel,
    previewHelpText
}: UnifiedMessageEditModalProps) => {
    const [message, setMessage] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (show) {
            setMessage(getMessageFromEvent(event));
        }
    }, [show, event, getMessageFromEvent]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(message);
        } catch (error) {
            console.error('Error saving message:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyAndClose = () => {
        navigator.clipboard.writeText(generatePreview ? generatePreview(event, message) : message);
        toast.success('Message copied to clipboard!');
        onHide();
    };

    // Create a temporary event with the current message for preview
    const previewEvent = { ...event };
    if (messageType === 'discord') {
        previewEvent.message = message;
    } else {
        previewEvent.socialMediaMessage = message;
    }
    const previewMessage = generatePreview ? generatePreview(previewEvent, message) : message;

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="edit" className="mb-3">
                    <Tab eventKey="edit" title="Edit Message">
                        <Form.Group>
                            <Form.Label>{label}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={8}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="has-fixed-size"
                            />
                            <Form.Text className="text-muted">
                                {helpText}
                            </Form.Text>
                        </Form.Group>
                    </Tab>
                    {generatePreview && (
                        <Tab eventKey="preview" title="Preview">
                            <Form.Group>
                                <Form.Label>
                                    {previewLabel || 'Preview'}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={previewMessage}
                                    rows={16}
                                    readOnly
                                    className="has-fixed-size"
                                />
                                <Form.Text className="text-muted">
                                    {previewHelpText || 'This is how your message will look.'}
                                </Form.Text>
                            </Form.Group>
                        </Tab>
                    )}
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button 
                    variant="success" 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleCopyAndClose}
                >
                    Copy and Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UnifiedMessageEditModal;
