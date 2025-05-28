
import { Link, useParams } from "react-router-dom";
import { useEventSignupOutletMembers } from "./outletContext";
import { Card, Container } from "react-bootstrap";
import { auth } from "../../util/firebase";

export const EventSignupStart = () => {
  const { eventId } = useParams();
  const { event } = useEventSignupOutletMembers();

  const signup = event.signups.find((signup) => {
    // @ts-expect-error - Nasty, why is this not a real DocumentReference?
    return signup.dj_refs.some((ref) => ref._path.segments.join("/") === `djs/${auth.currentUser?.uid}`);
  });

  // The event should be sanitized of all signups other than the current DJ via the google cloud function.
  if (event.signups.length > 0) {

    return <Container className="mt-4 background-white shadow p-4">
      <h2 className="display-4">You are signed up for {event.name} ({event.start_datetime.toLocaleDateString()})!</h2>

      {signup && (
        <div className="my-3">
          <Card>
            <Card.Header className="bg-secondary text-white">
            <Card.Title>Submission:</Card.Title>
            </Card.Header>
              <Card.Body>
                <Card.Text>
                  <ul>
                    <li><strong>Name:</strong> {signup.name}</li>
                    <li><strong>Back to Back?:</strong> {signup.type}</li>
                    <li><strong>Live/Prerecord:</strong> {signup.type}</li>
                    <li><strong>Stream Link:</strong> NYI</li>
                    <li><strong>Duration:</strong> {signup.requested_duration}</li>
                    <li><strong>Available From:</strong> NYI</li>
                    <li><strong>Available To:</strong> NYI</li>
                    <li><strong>Notes:</strong> NYI</li>
                    {/* Add more fields as needed */}
                  </ul>
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-center">
                <Link to={`/eventSignup/${eventId}/wizard`} className="btn btn-primary btn-lg">
                Update Signup
              </Link>
              </Card.Footer>
          </Card>

        </div>
      )}

      <p className="text-center mt-4">If there are questions, this should be a link to the discord channel.</p>
      
    </Container>
  }

  return <Container className="mt-4 text-center bg-white shadow p-4">
    <h2 className="display-4">Sign up for {event.name} ({event.start_datetime.toLocaleDateString()})</h2>
    <p>Ready to get started? Click the button below to begin the signup process.</p>
    <Link to={`/eventSignup/${eventId}/wizard`} className="btn btn-primary btn-lg">
      Get Started
    </Link>
  </Container>
}