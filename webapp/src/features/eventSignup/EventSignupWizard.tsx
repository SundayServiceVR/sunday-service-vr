import React from "react";
import { Container, Form, Button, ProgressBar } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { auth } from "../../util/firebase";
import StepPerformerInfo from "./StepPerformerInfo";
import StepAvailability from "./StepAvailability";
import StepStreamDetails from "./StepStreamDetails";
import StepConfirmation from "./StepConfirmation";
import { EventSignupFormData } from "./types.ts";
import { useEventSignupOutletMembers } from "./outletContext.ts";

export const EventSignupWizard = () => {
    const { eventId: event_id } = useParams();
    const [toastMsg, setToastMsg] = React.useState<string | null>(null);
    const [step, setStep] = React.useState(0);
    const { dj, event } = useEventSignupOutletMembers();

    const navigate = useNavigate();

    const existingSignup = event.signups.find(
        (signup) => signup.dj_refs.some((ref) => {
            //@ts-expect-error - Nasty, why is this not a real DocumentReference?
            return ref._path.segments.join("/") === `djs/${auth.currentUser?.uid}`
        })
    );

    const [formData, setFormData] = React.useState<EventSignupFormData>({
        event_id: event_id ?? "",
        dj_name: existingSignup?.name ?? dj.dj_name,
        requested_duration: existingSignup?.requested_duration ?? undefined,
        type: existingSignup?.type ?? undefined,
        // streamLink: existingSignup?.stream_source_url ?? "",
        // is_b2b: existingSignup?.is_b2b ? "true" : "false",
        // availableFrom: existingSignup?.availableFrom ?? "",
        // availableTo: existingSignup?.availableTo ?? "",
        


    });
    const [validated, setValidated] = React.useState(false);

    const steps = [
        StepPerformerInfo,
        StepAvailability,
        StepStreamDetails,
        StepConfirmation,
    ];

    const CurrentStep = steps[step];

    const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value, type } = target;
        let newValue: string | boolean = value;
        if (type === "checkbox") {
            newValue = (target as HTMLInputElement).checked;
        }
        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const validateStep = () => {
        // Basic validation for each step
        // Dynamically validate visible fields in the current step

        const stepFields = document.querySelectorAll(
            'form [name]:not([type="hidden"])'
        );
        for (const field of Array.from(stepFields)) {
            const input = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (
                input.required &&
                (
                    (input.type === "checkbox" && input instanceof HTMLInputElement && !input.checked) ||
                    (input.type !== "checkbox" && !input.value)
                )
            ) {

                return false;
            }
        }
        return true;
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setValidated(true);
        if (validateStep()) {
            setStep((s) => s + 1);
            setValidated(false);
        }
    };

    const handleBack = () => {
        setStep((s) => s - 1);
        setValidated(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateStep()) {
            setValidated(true);
            return;
        }
        let endpoint = "/eventSignupIntake";
        if (process.env.NODE_ENV === "development") {
            endpoint = "http://localhost:5001/sunday-service-vr/us-central1/eventSignupIntake";
        }
        const idToken = await auth.currentUser?.getIdToken();
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
                },
                body: JSON.stringify(formData),
            });
            
            if(response.ok) {
                navigate(`/eventSignup/${event_id}`);
            } else {
                setToastMsg(`Response status: ${response.status}`);
            }

        } catch (error) {
            setToastMsg("Submission failed");
        }
    };

    return (
        <Container className="mt-4 bg-white shadow p-4">
            <ProgressBar now={((step + 1) / steps.length) * 100} className="mb-3" />
            <h1 className="display-4">SignUp: {event.name} - {event.start_datetime.toLocaleDateString()}</h1>
            <Form
                noValidate
                validated={validated}
                onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}
                className="mt-4"
            >
                <input type="hidden" name="event_id" value={event_id} />
                <CurrentStep formData={formData} onChange={handleChange} />
                <div className="d-flex justify-content-between mt-4">
                  
                    <Button variant="secondary" onClick={handleBack} type="button" disabled={step === 0}>
                        Back
                    </Button>
                 
                    {step < steps.length - 1 ? (
                        <Button type="submit" className="btn btn-primary">
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" className="btn btn-primary">
                            Submit
                        </Button>
                    )}
                </div>
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