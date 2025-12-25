import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Event } from '../../../util/types';
import { toast } from 'react-hot-toast';
import { LINEUP_POSTER_MAX_FILE_SIZE_MB, validateLineupPosterFile } from '../../../util/util';

interface LineupPosterModalProps {
    show: boolean;
    onHide: () => void;
    event: Event;
    onFileChange: (file: File | null) => void;
}

export const LineupPosterModal: React.FC<LineupPosterModalProps> = ({
    show,
    onHide,
    event,
    onFileChange,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;

        const { valid, errorMessage } = validateLineupPosterFile(file);
        if (!valid) {
            if (errorMessage) {
                toast.error(errorMessage);
            }
            input.value = "";
            return;
        }

        setSelectedFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSave = () => {
        if (selectedFile) {
            onFileChange(selectedFile);
            toast.success('Lineup poster will be saved when you save the event');
        }
        handleClose();
    };

    const handleRemove = () => {
        onFileChange(null);
        toast.success('Lineup poster removed');
        handleClose();
    };

    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Upload Lineup Poster</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Select Lineup Poster Image</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                        Upload an image for the lineup whiteboard/OBS overlays. Maximum file size: {LINEUP_POSTER_MAX_FILE_SIZE_MB}MB.
                    </Form.Text>
                </Form.Group>

                {(previewUrl || event.lineup_poster_url) && (
                    <div className="mt-3">
                        <Form.Label>Preview</Form.Label>
                        <div className="text-center">
                            <img
                                src={previewUrl || event.lineup_poster_url}
                                alt="Lineup poster preview"
                                style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                )}

                {event.lineup_poster_url && !selectedFile && (
                    <div className="mt-3">
                        <p className="text-success">
                            <strong>Current Status:</strong> A lineup poster is already uploaded for this event.
                        </p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                {event.lineup_poster_url && (
                    <Button variant="danger" onClick={handleRemove} className="me-auto">
                        Remove Current Poster
                    </Button>
                )}
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                {selectedFile && (
                    <Button variant="primary" onClick={handleSave}>
                        Upload Poster
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
