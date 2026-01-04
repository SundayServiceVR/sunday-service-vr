import { Form, Button } from "react-bootstrap";
import { Host, Dj } from "../../util/types";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { LINEUP_POSTER_MAX_FILE_SIZE_MB, validateLineupPosterFile } from "../../util/util";
import { DocumentReference } from "firebase/firestore";
import { DjSearchSelect } from "../dj/DjSearchSelect";

type Props = {
    host: Host;
    onHostChange: (host: Host) => void;
    onHostPosterFileChange?: (file: File | null) => void;
    showDjSelector?: boolean;
}

const HostForm = ({ host, onHostChange, onHostPosterFileChange, showDjSelector = true }: Props) => {
    const [selectedDj, setSelectedDj] = useState<Dj | null>(null);

    useEffect(() => {
        // If host already has a dj_ref, we could fetch and display it here if needed
        // For now, we'll just track new selections
    }, [host.dj_ref]);

    const handleDjSelect = (dj: Dj, djRef: DocumentReference) => {
        setSelectedDj(dj);
        onHostChange({ ...host, dj_ref: djRef });
    };

    const handleClearDj = () => {
        setSelectedDj(null);
        onHostChange({ ...host, dj_ref: undefined });
    };

    return (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label>
                    Host Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                    placeholder="Host Name"
                    type="text"
                    value={host.host_name}
                    required
                    onChange={(e) => {
                        onHostChange({ ...host, host_name: e.target.value });
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>
                    Host Poster Image
                </Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
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

                        if (onHostPosterFileChange) {
                            onHostPosterFileChange(file);
                        }
                    }}
                />
                <Form.Text className="text-muted d-block mb-2">
                    Optional. Upload a poster image for this host. Maximum file size: {LINEUP_POSTER_MAX_FILE_SIZE_MB}MB.
                </Form.Text>
                {host.host_poster_url && (
                    <div className="mt-2">
                        <Form.Label>Current Host Poster Preview</Form.Label>
                        <div>
                            <img
                                src={host.host_poster_url}
                                alt="Host poster preview"
                                style={{ maxHeight: 200 }}
                            />
                        </div>
                    </div>
                )}
            </Form.Group>

            {showDjSelector && (
                <Form.Group className="mb-3">
                    <Form.Label>
                        Associated DJ (Optional)
                    </Form.Label>
                    {selectedDj || host.dj_ref ? (
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted">
                                {selectedDj ? `${selectedDj.dj_name} (${selectedDj.public_name})` : "DJ Selected"}
                            </span>
                            <Button variant="outline-danger" size="sm" onClick={handleClearDj}>
                                Clear
                            </Button>
                        </div>
                    ) : (
                        <DjSearchSelect onDjSelect={handleDjSelect} />
                    )}
                    <Form.Text className="text-muted">
                        Optionally link this host to a DJ in the roster.
                    </Form.Text>
                </Form.Group>
            )}
        </Form>
    );
};

export default HostForm;
