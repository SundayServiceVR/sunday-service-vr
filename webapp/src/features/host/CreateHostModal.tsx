import { Modal, Button, Stack } from "react-bootstrap";
import { useState } from "react";
import { Host } from "../../util/types";
import HostForm from "./HostForm";
import { createHost, updateHost } from "../../store/host";
import { toast } from "react-hot-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../util/firebase";
import Spinner from "../../components/spinner/Spinner";
import { DocumentReference } from "firebase/firestore";

type Props = {
    show: boolean;
    onHide: () => void;
    onHostCreated: (host: Host, hostRef: DocumentReference) => void;
}

const CreateHostModal = ({ show, onHide, onHostCreated }: Props) => {
    const [host, setHost] = useState<Host>({ host_name: "" });
    const [hostPosterFile, setHostPosterFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);

    const handleCreate = async () => {
        if (!host.host_name.trim()) {
            toast.error("Host name is required");
            return;
        }

        setBusy(true);
        try {
            // Create the host first to get an ID
            const hostRef = await createHost(host);

            // If a poster was uploaded, upload it and update the host
            if (hostPosterFile && hostRef.id) {
                const safeFileName = hostPosterFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
                const storagePath = `host-posters/${hostRef.id}/${Date.now()}_${safeFileName}`;
                const storageRef = ref(storage, storagePath);
                
                await uploadBytes(storageRef, hostPosterFile);
                const downloadUrl = await getDownloadURL(storageRef);

                host.host_poster_path = storagePath;
                host.host_poster_url = downloadUrl;
                
                // Update the host document in Firestore with the poster information
                await updateHost(hostRef.id, host);
            }

            const createdHost = { ...host, id: hostRef.id };
            
            toast.success("Host created successfully!");
            onHostCreated(createdHost, hostRef);
            
            // Reset form
            setHost({ host_name: "" });
            setHostPosterFile(null);
            onHide();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to create host";
            toast.error(errorMessage);
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = () => {
        setHost({ host_name: "" });
        setHostPosterFile(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleCancel} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create New Host</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {busy ? (
                    <Spinner type="logo" />
                ) : (
                    <HostForm
                        host={host}
                        onHostChange={setHost}
                        onHostPosterFileChange={setHostPosterFile}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Stack direction="horizontal" gap={3}>
                    <Button variant="secondary" onClick={handleCancel} disabled={busy}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreate} disabled={busy}>
                        Create Host
                    </Button>
                </Stack>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateHostModal;
