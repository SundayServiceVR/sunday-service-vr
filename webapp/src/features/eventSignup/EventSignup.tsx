import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useParams } from "react-router";

export const EventSignupForm = () => {
    const { eventId } = useParams();
    const [toastMsg, setToastMsg] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            const response = await fetch("/eventSignupIntake", {
                method: "POST",
                body: formData,
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
                <Form.Group className="mb-3" controlId="streamLink">
                    <Form.Label>Stream Link</Form.Label>
                    <Form.Control type="url" name="streamLink" placeholder="Enter your stream link" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="djName">
                    <Form.Label>DJ Name</Form.Label>
                    <Form.Control type="text" name="djName" placeholder="Enter your DJ name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="timeAvailability">
                    <Form.Label>Time Availability (Include Timezones)</Form.Label>
                    <Form.Control as="textarea" rows={3} name="timeAvailability" placeholder="Enter your availability" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="liveOrPrerecord">
                    <Form.Label>Live or Prerecord</Form.Label>
                    <Form.Select name="liveOrPrerecord">
                        <option value="Live">Live</option>
                        <option value="New Prerecord">New Prerecord</option>
                        <option value="Existing Prerecord">Existing Prerecord</option>
                    </Form.Select>
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