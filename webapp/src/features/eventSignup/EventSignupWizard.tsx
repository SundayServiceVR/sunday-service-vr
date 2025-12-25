import React from "react";
import { Container, Form, Button, ProgressBar } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { auth } from "../../util/firebase";
import StepPerformerInfo from "./wizardSteps/StepPerformerInfo.tsx";
import StepAvailability from "./wizardSteps/StepAvailability.tsx";
import StepStreamDetails from "./wizardSteps/StepStreamDetails.tsx";
import StepConfirmation from "./wizardSteps/StepConfirmation.tsx";
import { useEventSignupOutletMembers } from "./outletContext.ts";
import { Timestamp } from "firebase/firestore";
import { EventSignupFormData } from "../../util/types.ts";
import { getDjStreamLinks } from "../../util/djTypeHelpers.ts";
import { useEventDjCache } from "../../contexts/useEventDjCache";

export const EventSignupWizard = () => {
    const { eventId: event_id } = useParams();
    const [toastMsg, setToastMsg] = React.useState<string | null>(null);
    const [step, setStep] = React.useState(0);
    const { dj, event, loadEvent } = useEventSignupOutletMembers();
    const { getEventsByDjId } = useEventDjCache();

    const navigate = useNavigate();

    const djId = auth.currentUser?.uid;

    if(!djId) {
        throw new Error("Attempting to sing up without a current djId")
    }

    const existingSignup = event.signups.find(
        (signup) => signup.dj_refs.some((ref) => {
            // @ts-expect-error - Nasty, why is this not a real DocumentReference?
            // Yes, this is a hack.  No, the solution is not ref.path right now.
            return ref._path.segments.join("/") === `djs/${djId}`
        })
    );

    const allDjEvents  = djId ? getEventsByDjId(djId) : [];
    const priorStreamLinks = dj ? getDjStreamLinks(djId, allDjEvents) : [];
    const lastStreamLink = priorStreamLinks.length > 0 ? priorStreamLinks[0] : undefined;

    const defaultFormData = {
        event_id: event_id ?? "",
        name: dj.dj_name,
        requested_duration: undefined,
        type: undefined,
        is_b2b: false,
        available_from: "any",
        available_to: "any",
        stream_link: lastStreamLink ?? "",
    };

    const [formData, setFormData] = React.useState<EventSignupFormData>({
        ...defaultFormData,
        ...existingSignup?.event_signup_form_data,
        available_from: existingSignup?.event_signup_form_data?.available_from ?? "any",
        available_to: existingSignup?.event_signup_form_data?.available_to ?? "any",
    });
    const [validated, setValidated] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false); // <-- Add submitting state

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
        
        let newValue: string | number | boolean | Timestamp = value;

        // Handle checkbox inputs
        if (type === "checkbox") {
            newValue = (target as HTMLInputElement).checked;
        }
        
        // Handle specific cases for date fields
        if(name === "available_from" || name === "available_to") {
            newValue = Timestamp.fromDate(new Date(value));
        }

        // TODO:  Convert this to 'yes' and 'no' to avoid having to translate between 1/0 and true/false
        // Handle specific cases for boolean values
        if(name === "is_b2b") {
            newValue = (value === "1") ? true : false;
        }

        // Handle specific cases for numbers
        if(name === "requested_duration") {
            newValue = parseFloat(value) as EventSignupFormData["requested_duration"] ?? 1;
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
        setSubmitting(true); // <-- Set submitting true
        let endpoint = "https://eventsignupintake-diczrrhb6a-uc.a.run.app/eventSignupIntake";
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
                await loadEvent();
                navigate(`/eventSignup/${event_id}`);
            } else {
                setToastMsg(`Response status: ${response.status}`);
            }

        } catch (error) {
            setToastMsg("Submission failed");
        } finally {
            setSubmitting(false); // <-- Always unset submitting
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
                style={submitting ? { pointerEvents: "none", opacity: 0.6 } : {}} // <-- Block input
            >
                <input type="hidden" name="event_id" value={event_id} />
                <CurrentStep
                    formData={formData}
                    onChange={handleChange}
                    event={event}
                    priorStreamLinks={priorStreamLinks}
                />
                <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={handleBack} type="button" disabled={step === 0 || submitting}>
                        Back
                    </Button>
                    {step < steps.length - 1 ? (
                        <Button type="submit" className="btn btn-primary" disabled={submitting}>
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
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