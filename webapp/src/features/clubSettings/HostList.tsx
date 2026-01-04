import { useState, useEffect } from "react";
import { Card, Table, Button, Stack, Modal } from "react-bootstrap";
import { Host } from "../../util/types";
import { getAllHosts, deleteHost, updateHost } from "../../store/host";
import { toast } from "react-hot-toast";
import Spinner from "../../components/spinner/Spinner";
import HostForm from "../host/HostForm";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../util/firebase";
import { confirm } from "../../components/confirm";

const HostList = () => {
    const [hosts, setHosts] = useState<Host[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingHost, setEditingHost] = useState<Host | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [hostPosterFile, setHostPosterFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadHosts();
    }, []);

    const loadHosts = async () => {
        try {
            setLoading(true);
            const hostList = await getAllHosts();
            setHosts(hostList);
        } catch (error) {
            toast.error("Failed to load hosts");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (host: Host) => {
        setEditingHost(host);
        setHostPosterFile(null);
        setShowEditModal(true);
    };

    const handleDelete = async (host: Host) => {
        if (!host.id) return;

        confirm({
            title: "Delete Host",
            message: `Are you sure you want to delete "${host.host_name}"?`,
            confirmButton: {
                text: "Delete",
                action: async () => {
                    try {
                        // Delete the poster from storage if it exists
                        if (host.host_poster_path) {
                            try {
                                const storageRef = ref(storage, host.host_poster_path);
                                await deleteObject(storageRef);
                            } catch (storageError) {
                                console.error("Failed to delete poster from storage:", storageError);
                            }
                        }

                        await deleteHost(host.id!);
                        toast.success("Host deleted successfully");
                        loadHosts();
                    } catch (error) {
                        toast.error("Failed to delete host");
                        console.error(error);
                    }
                }
            },
            cancelButton: {
                text: "Cancel"
            }
        });
    };

    const handleSaveEdit = async () => {
        if (!editingHost || !editingHost.id) return;

        setSaving(true);
        try {
            const updatedHost = { ...editingHost };

            // If a new poster was uploaded, handle it
            if (hostPosterFile) {
                // Delete old poster if it exists
                if (editingHost.host_poster_path) {
                    try {
                        const oldStorageRef = ref(storage, editingHost.host_poster_path);
                        await deleteObject(oldStorageRef);
                    } catch (error) {
                        console.error("Failed to delete old poster:", error);
                    }
                }

                // Upload new poster
                const safeFileName = hostPosterFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
                const storagePath = `host-posters/${editingHost.id}/${Date.now()}_${safeFileName}`;
                const storageRef = ref(storage, storagePath);
                
                await uploadBytes(storageRef, hostPosterFile);
                const downloadUrl = await getDownloadURL(storageRef);

                updatedHost.host_poster_path = storagePath;
                updatedHost.host_poster_url = downloadUrl;
            }

            await updateHost(editingHost.id, updatedHost);
            toast.success("Host updated successfully");
            setShowEditModal(false);
            setEditingHost(null);
            setHostPosterFile(null);
            loadHosts();
        } catch (error) {
            toast.error("Failed to update host");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingHost(null);
        setHostPosterFile(null);
    };

    if (loading) {
        return <Spinner type="logo" />;
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title>Manage Hosts</Card.Title>
                    {hosts.length === 0 ? (
                        <p className="text-muted">No hosts created yet. Create one from the event setup page.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Host Name</th>
                                    <th>Has Poster</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hosts.map((host) => (
                                    <tr key={host.id}>
                                        <td>{host.host_name}</td>
                                        <td>{host.host_poster_url ? "✓" : "-"}</td>
                                        <td>
                                            <Stack direction="horizontal" gap={2}>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(host)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(host)}
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={handleCancelEdit} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Host</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {saving ? (
                        <Spinner type="logo" />
                    ) : editingHost ? (
                        <HostForm
                            host={editingHost}
                            onHostChange={setEditingHost}
                            onHostPosterFileChange={setHostPosterFile}
                        />
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Stack direction="horizontal" gap={3}>
                        <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                            Save Changes
                        </Button>
                    </Stack>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default HostList;
