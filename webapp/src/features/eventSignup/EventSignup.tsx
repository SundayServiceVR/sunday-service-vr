import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useParams } from "react-router";
import { auth } from "../../util/firebase";

export const EventSignupForm = () => {
    const { eventId } = useParams();
    const [toastMsg, setToastMsg] = React.useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        let endpoint = "/eventSignupIntake";
        if (process.env.NODE_ENV === "development") {
            endpoint = "http://localhost:5001/sunday-service-vr/us-central1/eventSignupIntake";
        }

        const idToken = await auth.currentUser?.getIdToken();

        try {
            const jsonBody = Object.fromEntries(formData.entries());

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
                },
                body: JSON.stringify(jsonBody),
            });
            setToastMsg(`Response status: ${response.status}`);
        } catch (error) {
            setToastMsg("Submission failed");
        }
    };

    return (
        <Container>
            <h1 className="display-6">Event Signup for {eventId}</h1>
            <p>Fill out the form below to sign up for the event.</p>
            <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Control type="hidden" name="eventId" value={eventId} />
                    <Form.Group className="mb-3" controlId="djName">
                    <Form.Label>DJ Name</Form.Label>
                <Form.Control type="text" name="djName" placeholder="Enter your DJ name" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="isB2B">
                    <Form.Label>Is this set a Back-to-Back?</Form.Label>
                    <Form.Select name="isB2B" defaultValue="No">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="b2bName">
                    <Form.Label>What is your back-to-back name?</Form.Label>
                    <Form.Control
                        type="text"
                        name="b2bName"
                        placeholder="Enter your B2B name"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="b2bName">
                    <Form.Label>Who else is included in the set?</Form.Label>
                    <Form.Control
                        type="text"
                        name="b2bName"
                        placeholder="Enter your B2B name"
                    />
                </Form.Group>


                <hr />           

                <Form.Group className="mb-3" controlId="availableFrom">
                    <Form.Label>Available From</Form.Label>
                    <Form.Control type="time" name="availableFrom" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="availableTo">
                    <Form.Label>Available Up To</Form.Label>
                    <Form.Control type="time" name="availableTo" />
                </Form.Group>

                <hr />
                
                <Form.Group className="mb-3" controlId="type">
                    <Form.Label>Live or Prerecord</Form.Label>
                    <Form.Select name="type">
                        <option value="Live">Live</option>
                        <option value="New Prerecord">New Prerecord</option>
                        <option value="Existing Prerecord">Existing Prerecord</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="streamLink">
                    <Form.Label>Stream Link</Form.Label>
                    <Form.Control type="url" name="streamLink" placeholder="Enter your stream link" />
                </Form.Group>
                <hr />
                <Form.Group className="mb-3" controlId="confirmExpectations">
                    <Form.Check
                        type="checkbox"
                        name="confirmExpectations"
                        label="I confirm that I have read and understand the expectations of a performer."
                        required
                    />
                </Form.Group>
                <Button type="submit" className="btn btn-primary">Submit</Button>
            </Form>
            {toastMsg && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        background: "#333",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: 8,
                        zIndex: 9999,
                    }}
                    onClick={() => setToastMsg(null)}
                >
                    {toastMsg}
                </div>
            )}
        </Container>
    );
};