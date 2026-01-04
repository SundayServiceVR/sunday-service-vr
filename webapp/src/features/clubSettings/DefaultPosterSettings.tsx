import { useState, useEffect } from "react";
import { Card, Form, Button, Stack } from "react-bootstrap";
import { Club } from "../../util/types";
import { getClubSettings, updateClubSettings } from "../../store/clubSettings";
import { toast } from "react-hot-toast";
import { LINEUP_POSTER_MAX_FILE_SIZE_MB, validateLineupPosterFile } from "../../util/util";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../util/firebase";
import Spinner from "../../components/spinner/Spinner";

const DefaultPosterSettings = () => {
    const [settings, setSettings] = useState<Club>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const clubSettings = await getClubSettings();
            setSettings(clubSettings);
        } catch (error) {
            toast.error("Failed to load settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        // Clean up previous preview URL
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        setPosterFile(file);

        if (file) {
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedSettings = { ...settings };

            // If a new poster was uploaded
            if (posterFile) {
                // Delete old poster if it exists
                if (settings.default_host_poster_path) {
                    try {
                        const oldStorageRef = ref(storage, settings.default_host_poster_path);
                        await deleteObject(oldStorageRef);
                    } catch (error) {
                        console.error("Failed to delete old default poster:", error);
                    }
                }

                // Upload new poster
                const safeFileName = posterFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
                const storagePath = `default-poster/${Date.now()}_${safeFileName}`;
                const storageRef = ref(storage, storagePath);
                
                await uploadBytes(storageRef, posterFile);
                const downloadUrl = await getDownloadURL(storageRef);

                updatedSettings.default_host_poster_path = storagePath;
                updatedSettings.default_host_poster_url = downloadUrl;
            }

            await updateClubSettings(updatedSettings);
            setSettings(updatedSettings);
            setPosterFile(null);
            
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }

            toast.success("Default poster updated successfully");
        } catch (error) {
            toast.error("Failed to update default poster");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePoster = async () => {
        setSaving(true);
        try {
            // Delete poster from storage if it exists
            if (settings.default_host_poster_path) {
                try {
                    const storageRef = ref(storage, settings.default_host_poster_path);
                    await deleteObject(storageRef);
                } catch (error) {
                    console.error("Failed to delete poster from storage:", error);
                }
            }

            const updatedSettings: Club = {
                ...settings,
                default_host_poster_path: undefined,
                default_host_poster_url: undefined,
            };

            await updateClubSettings(updatedSettings);
            setSettings(updatedSettings);
            setPosterFile(null);
            
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }

            toast.success("Default poster removed successfully");
        } catch (error) {
            toast.error("Failed to remove default poster");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Spinner type="logo" />;
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>Default Host Poster</Card.Title>
                <Card.Text className="text-muted">
                    This poster will be shown on the whiteboard when no host is assigned to an event, 
                    or when the assigned host doesn't have a poster image.
                </Card.Text>

                <Form.Group className="mb-3">
                    <Form.Label>
                        Default Poster Image
                    </Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        disabled={saving}
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

                            handleFileChange(file);
                        }}
                    />
                    <Form.Text className="text-muted d-block mb-2">
                        Maximum file size: {LINEUP_POSTER_MAX_FILE_SIZE_MB}MB.
                    </Form.Text>

                    {(previewUrl || settings.default_host_poster_url) && (
                        <div className="mt-3">
                            <Form.Label>
                                {previewUrl ? "Preview" : "Current Default Poster"}
                            </Form.Label>
                            <div>
                                <img
                                    src={previewUrl || settings.default_host_poster_url}
                                    alt="Default poster preview"
                                    style={{ maxHeight: 300, maxWidth: "100%" }}
                                />
                            </div>
                        </div>
                    )}
                </Form.Group>

                <Stack direction="horizontal" gap={3}>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!posterFile || saving}
                    >
                        {saving ? "Saving..." : "Save Default Poster"}
                    </Button>
                    {settings.default_host_poster_url && (
                        <Button
                            variant="outline-danger"
                            onClick={handleRemovePoster}
                            disabled={saving}
                        >
                            Remove Default Poster
                        </Button>
                    )}
                </Stack>
            </Card.Body>
        </Card>
    );
};

export default DefaultPosterSettings;
