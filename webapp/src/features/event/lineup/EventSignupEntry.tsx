import { Card, Stack, Button, Modal, Form, Alert } from "react-bootstrap";
import { useState } from "react"; // Import useState
import IssuePopoverIcon from "./IssuePopoverIcon";
import { useGetSignupIssues } from "./useGetSignupIssues";
import { EventSignup, Event } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import EventSignupDjDetails from "./EventSignupDjDetails";
import EventSlotDetails from "./EventSignupDetails";
import { DocumentReference } from "firebase/firestore";
import { Plus, Clock, ChevronDown, ChevronRight } from "react-feather"; // Import the Feather Plus icon and Clock icon
import { getPrettyValueFromAvailability } from "../../eventSignup/utils";

type Props = {
  signup: EventSignup;
  onAddSlotToLineup: (signup: EventSignup) => void;
  onRemoveSignup: (signup: EventSignup) => void;
  onUpdateSignup: (signup: EventSignup) => void;
  setSelectedSignup: (signup: EventSignup | null) => void;
  setShowModal: (show: boolean) => void;
  event?: Event;
};

const EventSignupEntry = ({
  signup,
  onAddSlotToLineup,
  onRemoveSignup,
  onUpdateSignup,
  setSelectedSignup,
  setShowModal,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to hidden/collapsed

  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage modal visibility
  const getSignupIssues = useGetSignupIssues();
  const issues = getSignupIssues(signup);

  return (
    <>
      <Card key={`signup-${signup.uuid}`} className="rounded-0">
        <Card.Header className="rounded-0 p-2">
          <Stack direction="horizontal" gap={1}>
            <div
              className="d-flex align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </div>
            <div className="d-flex flex-column">
              <div className="lead">{signup.name}</div>
              <div className="d-flex align-items-center gap-2">
                {issues.length > 0 && (
                  <IssuePopoverIcon idSuffix={signup.uuid} issues={issues} />
                )}
                {/* Availability info */}
                {signup.event_signup_form_data?.available_from && signup.event_signup_form_data?.available_to && (
                  <small className="text-muted d-flex align-items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {signup.event_signup_form_data.available_from === "any" && signup.event_signup_form_data.available_to === "any"
                        ? "Any Time"
                        : `${getPrettyValueFromAvailability(signup.event_signup_form_data.available_from)} - ${getPrettyValueFromAvailability(signup.event_signup_form_data.available_to)}`
                      }
                    </span>
                  </small>
                )}
                {/* Set type */}
                {signup.event_signup_form_data?.type && (
                  <small className="text-muted">
                    • {signup.event_signup_form_data.type}
                  </small>
                )}
                {/* Debut indicator */}
                {signup.is_debut && (
                  <small className="text-success fw-bold">
                    • DEBUT
                  </small>
                )}
              </div>
            </div>
            <div className="ms-auto"></div>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onAddSlotToLineup(signup)}
            >
              <Plus /> Add to Lineup
            </Button>
            <ActionMenu
              options={[
                {
                  label: "Add To Lineup",
                  onClick: () => {
                    onAddSlotToLineup(signup);
                  },
                },
                {
                  label: "Add DJ to Slot (B2B)",
                  onClick: () => {
                    setSelectedSignup(signup); // Set the selected signup
                    setShowModal(true); // Show the modal
                  },
                },
                {
                  label: "View Signup Info",
                  onClick: () => {
                    setShowSignupModal(true); // Set the selected signup
                  },
                },
                {
                  label: "Remove Signup",
                  onClick: () => {
                    onRemoveSignup(signup);
                  },
                },
              ]}
            />
          </Stack>
        </Card.Header>
        {!isCollapsed && (
          <Card.Body className="p-2">
            <div className="my-3">
              {issues.map((issue) => (
                <>
                  <div key={issue.id} className="mt-3">
                    <Alert variant="warning">
                      <strong>{issue.title}:</strong> {issue.message}
                    </Alert>
                  </div>
                </>
              ))}
              { issues.length > 0 ? <hr /> : null }
              <EventSlotDetails signup={signup} onUpdateSignup={onUpdateSignup} />
              <hr />
              {signup.dj_refs?.map((djRef: DocumentReference) => (
                <EventSignupDjDetails
                  key={djRef.id}
                  djRef={djRef}
                  onRemoveDjRef={(dj_ref) =>
                    onUpdateSignup({
                      ...signup,
                      dj_refs: signup.dj_refs.filter((ref) => ref.id !== dj_ref.id),
                    })
                  }
                />
              ))}
            </div>
          </Card.Body>
        )}
      </Card>
      <Modal show={showSignupModal} onHide={() => setShowSignupModal(false)} centered>
        <Modal.Header closeButton onHide={() => setShowSignupModal(false)}>
          <Modal.Title>Signup Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            <Form>
              <Form.Group controlId="signupFormData">
                <Form.Label>Signup Form Data</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  readOnly
                  value={JSON.stringify(signup.event_signup_form_data, null, 4)}
                />
              </Form.Group>
            </Form>
          }
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EventSignupEntry;