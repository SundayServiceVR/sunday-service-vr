import { Card, Stack, Button, Modal, Form } from "react-bootstrap";
import { useState } from "react"; // Import useState
import { EventSignup } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import EventSignupDjDetails from "./EventSignupDjDetails";
import EventSlotDetails from "./EventSignupDetails";
import { DocumentReference } from "firebase/firestore";
import { Plus } from "react-feather"; // Import the Feather Plus icon
import { Row, Col } from "react-bootstrap"; // Import Row and Col from react-bootstrap

type Props = {
  signup: EventSignup;
  onAddSlotToLineup: (signup: EventSignup) => void;
  onRemoveSignup: (signup: EventSignup) => void;
  onUpdateSignup: (signup: EventSignup) => void;
  setSelectedSignup: (signup: EventSignup | null) => void;
  setShowModal: (show: boolean) => void;
};

const EventSignupEntry = ({
  signup,
  onAddSlotToLineup,
  onRemoveSignup,
  onUpdateSignup,
  setSelectedSignup,
  setShowModal,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapse

  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage modal visibility

  return (
    <>
      <Card key={`signup-${signup.uuid}`}>
        <Card.Header>
          <Stack direction="horizontal" gap={1}>
            <div className="lead">{signup.name}</div>
            <div className="ms-auto"></div>
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
        <Card.Body>
          <Row className="mb-3">
            {/* Hide Entry Button */}
            <Col xs={12} md={6} className="mb-2 mb-md-0">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? "Show Entry" : "Hide Entry"}
              </Button>
            </Col>
            {/* Add to Lineup Button */}
            <Col xs={12} md={6}>
              <Button
                variant="outline-success"
                className="w-100"
                onClick={() => onAddSlotToLineup(signup)}
              >
                <Plus className="me-2" /> Add to Lineup
              </Button>
            </Col>
          </Row>
          {!isCollapsed && (
            <>
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
            </>
          )}
        </Card.Body>
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