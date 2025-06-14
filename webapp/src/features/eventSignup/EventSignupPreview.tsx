import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { EventSignup } from "../../util/types";
import { getPrettyValueFromAvailability } from "./utils";

const EventSignupPreview = ({ signup, eventId }: { signup: EventSignup, eventId: string }) => (
    <Card>
        <Card.Header className="bg-secondary text-white">
            <Card.Title>Submission:</Card.Title>
        </Card.Header>
        <Card.Body>
            <ul>
                <li><strong>Name:</strong> {signup.event_signup_form_data?.name}</li>
                <li><strong>Back to Back?:</strong> {signup.event_signup_form_data?.is_b2b ? "Yes" : "No"}</li>
                <li><strong>Other B2B Members?:</strong> {signup.event_signup_form_data?.b2b_members_response}</li>
                <hr />
                <li><strong>Live/Prerecord:</strong> {signup.event_signup_form_data?.type}</li>
                <li><strong>Stream Link:</strong> {signup.event_signup_form_data?.stream_link}</li>
                <li><strong>Duration:</strong> {signup.event_signup_form_data?.requested_duration}</li>
                <li><strong>Available From:</strong> {getPrettyValueFromAvailability(signup.event_signup_form_data?.available_from)}</li>
                <li><strong>Available To:</strong> {getPrettyValueFromAvailability(signup.event_signup_form_data?.available_to)}</li>
                <hr />
                <li><strong>Notes:</strong> {signup.event_signup_form_data?.dj_notes}</li>
            </ul>
        </Card.Body>
        <Card.Footer className="text-center">
            <Link to={`/eventSignup/${eventId}/wizard`} className="btn btn-primary btn-lg">
                Update Signup
            </Link>
        </Card.Footer>
    </Card>
);

export default EventSignupPreview;