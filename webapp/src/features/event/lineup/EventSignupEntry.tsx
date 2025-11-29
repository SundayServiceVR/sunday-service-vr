import { Card, Stack, Button, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react"; // Import useState
import IssuePopoverIcon from "./components/IssuePopoverIcon";
import { useGetSignupIssues } from "./hooks/useGetSignupIssues";
import { EventSignup, Event, Dj } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import { DocumentReference } from "firebase/firestore";
import { Plus, Clock, ChevronDown, ChevronRight } from "react-feather"; // Import the Feather Plus icon and Clock icon
import { getPrettyValueFromAvailability } from "../../eventSignup/utils";
import { useEventDjCache } from "../../../contexts/useEventDjCache";
import DjDetails from "../../../components/DjDetails";
import { Container, Spinner } from "react-bootstrap";
import EventSlotDetails from "./EventSignupDetails";
import DjAvatarList from "./components/DjAvatarList"; // Import DjAvatarList component

type Props = {
  signup: EventSignup;
  onAddSlotToLineup: (signup: EventSignup) => void;
  onRemoveSignup: (signup: EventSignup) => void;
  onUpdateSignup: (signup: EventSignup) => void;
  setSelectedSignup: (signup: EventSignup | null) => void;
  setShowModal: (show: boolean) => void;
  event: Event;
};

function useDjData(djRefs: DocumentReference[] | undefined) {
  const { djCache, getEventsByDjId, reloadDj } = useEventDjCache();
  const [djData, setDjData] = useState<{ djRef: DocumentReference; loading: boolean; dj: Dj | null; djEvents: Event[] }[]>(
    djRefs?.map((djRef: DocumentReference) => ({ djRef, loading: true, dj: null, djEvents: [] })) || []
  );

  useEffect(() => {
    const fetchDjData = async () => {
      const updatedDjData = await Promise.all(
        djRefs?.map(async (djRef) => {
          const cached = djCache.get(djRef.id);
          if (cached) {
            return {
              djRef,
              dj: cached,
              djEvents: getEventsByDjId(djRef.id),
              loading: false,
            };
          }

          const reloaded = await reloadDj(djRef.id);
          return {
            djRef,
            dj: reloaded || null,
            djEvents: reloaded ? getEventsByDjId(djRef.id) : [],
            loading: false,
          };
        }) || []
      );
      setDjData(updatedDjData);
    };

    fetchDjData();
  }, [djRefs, djCache, getEventsByDjId, reloadDj]);

  return djData;
}

const EventSignupEntry = ({
  signup,
  onAddSlotToLineup,
  onRemoveSignup,
  onUpdateSignup,
  setSelectedSignup,
  setShowModal,
  event,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to hidden/collapsed

  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage modal visibility

  const { djCache } = useEventDjCache();

  // Helper to combine setSelectedSignup and setShowModal
  const openB2BModal = (signup: EventSignup) => {
    setSelectedSignup(signup);
    setShowModal(true);
  };

  const getSignupIssues = useGetSignupIssues({
    onUpdateSignup,
    openB2BModal,
  });
  const issues = getSignupIssues(signup, event);

  const djData = useDjData(signup.dj_refs);

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
            {/* Replace individual DJ avatar rendering with DjAvatarList */}
            <DjAvatarList djRefs={signup.dj_refs || []} />
            <div className="d-flex flex-column">
              <div className="lead d-flex align-items-center gap-2">
                <span>{signup.name}</span>
              </div>
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
                  onClick: () => openB2BModal(signup),
                },
                "divider",
                ...(signup.dj_refs?.flatMap((djRef: DocumentReference, index: number) => {
                  const dj = djCache.get(djRef.id);
                  const djName = dj?.dj_name || "DJ";
                  return [
                    ...(index > 0 ? ["divider" as const] : []),
                    {
                      label: `Edit ${djName} Info`,
                      onClick: () => {
                        window.open(`/djs/${djRef.id}`, '_blank', 'noreferrer');
                      },
                    },
                    {
                      label: `Remove ${djName} from Signup`,
                      onClick: () => {
                        onUpdateSignup({
                          ...signup,
                          dj_refs: signup.dj_refs.filter((ref) => ref.id !== djRef.id),
                        });
                      },
                    },
                  ];
                }) || []),
                "divider",
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
                <div key={issue.id} className="mt-3">
                  <Alert variant="warning">
                    <strong>{issue.title}:</strong> {issue.message}
                    {issue.actionLabel && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            if (issue.actionLabel === "Toggle Debut") {
                              onUpdateSignup({
                                ...signup,
                                is_debut: !signup.is_debut,
                              });
                            } else if (issue.actionLabel === "Add DJ to Slot") {
                              openB2BModal(signup);
                            } else if (typeof issue.action === "function") {
                              issue.action();
                            }
                          }}
                        >
                          {issue.actionLabel}
                        </Button>
                      </div>
                    )}
                  </Alert>
                </div>
              ))}
              {issues.length > 0 ? <hr /> : null}
              <EventSlotDetails signup={signup} onUpdateSignup={onUpdateSignup} />
              <hr />
              {djData.map(({ djRef, dj, djEvents, loading }) => {
                if (loading) {
                  return (
                    <Container key={djRef.id} className="d-flex justify-content-around">
                      <Spinner />
                    </Container>
                  );
                }

                if (!dj) {
                  return <p key={djRef.id}>No DJ Found</p>;
                }

                return (
                  <DjDetails
                    key={djRef.id}
                    dj={dj}
                    djRef={djRef}
                    djEvents={djEvents}
                  />
                );
              })}
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