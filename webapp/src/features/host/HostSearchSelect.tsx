import { useState, useEffect } from "react";
import { Form, Button, Stack } from "react-bootstrap";
import { Host } from "../../util/types";
import { db } from "../../util/firebase";
import { DocumentReference, collection, getDocs, query, orderBy } from "firebase/firestore";
import { docToHost } from "../../store/converters";
import CreateHostModal from "./CreateHostModal";

type Props = {
    onHostSelect: (host: Host | null, hostRef: DocumentReference | null) => void;
    selectedHostRef?: DocumentReference | null;
}

export const HostSearchSelect = ({ onHostSelect, selectedHostRef }: Props) => {
    const [hosts, setHosts] = useState<{ host: Host; ref: DocumentReference }[]>([]);
    const [selectedHostId, setSelectedHostId] = useState<string>("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadHosts();
    }, []);

    useEffect(() => {
        if (selectedHostRef) {
            setSelectedHostId(selectedHostRef.id);
        } else {
            setSelectedHostId("");
        }
    }, [selectedHostRef]);

    const loadHosts = async () => {
        const hostCollectionRef = collection(db, "hosts");
        const q = query(hostCollectionRef, orderBy("host_name", "asc"));
        const querySnapshot = await getDocs(q);
        
        const hostList = querySnapshot.docs.map((doc) => ({
            host: docToHost(doc),
            ref: doc.ref,
        }));
        
        setHosts(hostList);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        
        if (value === "create-new") {
            setShowCreateModal(true);
            return;
        }
        
        setSelectedHostId(value);
        
        if (value === "") {
            onHostSelect(null, null);
        } else {
            const selected = hosts.find(h => h.ref.id === value);
            if (selected) {
                onHostSelect(selected.host, selected.ref);
            }
        }
    };

    const handleHostCreated = (host: Host, hostRef: DocumentReference) => {
        // Reload hosts to include the new one
        loadHosts();
        setSelectedHostId(hostRef.id);
        onHostSelect(host, hostRef);
    };

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Host Poster</Form.Label>
                <Stack direction="horizontal" gap={2}>
                    <Form.Select 
                        value={selectedHostId} 
                        onChange={handleChange}
                        className="flex-grow-1"
                    >
                        <option value="">-- No Host Selected --</option>
                        {hosts.map(({ host, ref }) => (
                            <option key={ref.id} value={ref.id}>
                                {host.host_name}
                            </option>
                        ))}
                        <option value="create-new">+ Create New Host</option>
                    </Form.Select>
                    {selectedHostId && selectedHostId !== "create-new" && (
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => {
                                setSelectedHostId("");
                                onHostSelect(null, null);
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </Stack>
                <Form.Text className="text-muted">
                    Select a host for this event, or create a new one.
                </Form.Text>
            </Form.Group>

            <CreateHostModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onHostCreated={handleHostCreated}
            />
        </>
    );
};
