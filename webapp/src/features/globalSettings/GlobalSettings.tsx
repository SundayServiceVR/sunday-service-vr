import { useState, useEffect } from "react";
import { Form, Button, Container, Spinner, Alert, Card } from "react-bootstrap";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const GlobalSettings = () => {
    const [signupUrl, setSignupUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            const firestore = getFirestore();
            const docRef = doc(firestore, "global/global_settings");
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSignupUrl(docSnap.data().signup_url || "");
                } else {
                    console.warn("Global settings document does not exist.");
                }
            } catch (err) {
                console.error("Error fetching global settings:", err);
                setError("Failed to load global settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);

        const firestore = getFirestore();
        const docRef = doc(firestore, "global/global_settings");

        try {
            await setDoc(docRef, { signup_url: signupUrl }, { merge: true });
            setSuccess(true);
        } catch (err) {
            console.error("Error saving global settings:", err);
            setError("Failed to save global settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">Global Settings</h1>
            <Card className="shadow-sm">
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Settings saved successfully!</Alert>}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3" controlId="signupUrl">
                            <Form.Label>Signup URL</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="Enter signup URL"
                                value={signupUrl}
                                onChange={(e) => setSignupUrl(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default GlobalSettings;
