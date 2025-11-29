import { Stack, Button, Container, Row, Col } from "react-bootstrap";
import { Slot, Event, EventSignup } from "../../../util/types";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import { ArrowDown, ArrowUp, AlertTriangle, Clock } from "react-feather";
import EventSlotDetails from "./EventSignupDetails";
import { hasAvailabilityConflict } from "../util";
import { getPrettyValueFromAvailability } from "../../eventSignup/utils";
import DjDetails from "../../../components/DjDetails";
import { useEventDjCache } from "../../../contexts/useEventDjCache";

type Props = {
    index: number,
    slot: Slot,
    signup: EventSignup,
    event: Event,
    onSlotMoveSooner: () => void,
    onSlotMoveLater: () => void,
    onRemoveSlot: () => void,
    onUpdateSlot: (newSlot: Slot) => void,
    onUpdateSignup: (newSignup: EventSignup) => void,
}

const EventLineupSlot = ({
    onUpdateSignup,
    slot,
    signup,
    // event, // TODO:  Remove if we don't need this.
    onSlotMoveSooner,
    onSlotMoveLater,
    onRemoveSlot,
}: Props) => {
    const { djCache } = useEventDjCache();

    const hasConflict = hasAvailabilityConflict(slot, signup);

    return <Container className={`my-2 ${hasConflict ? 'border border-danger rounded p-2' : ''}`}>
        <Row>
            <Col xs={{ order: 1, span: 6 }} md={{ order: 1, span: "auto" }}>
                <span style={{ "width": "30px" }}>
                    <Stack gap={1}>
                        <div className="d-flex flex-column">
                          <span className={`lead mb-0 ${hasConflict ? 'text-danger fw-bold' : ''}`}>
                              {slot.start_time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {hasConflict && <AlertTriangle className="ms-1" size={16} />}
                          </span>
                          {/* Availability as subtitle */}
                          {signup.event_signup_form_data?.available_from && signup.event_signup_form_data?.available_to && (
                            <small className={`text-muted d-flex align-items-center gap-1 ${hasConflict ? 'text-danger' : ''}`} style={{ fontSize: "0.65rem" }}>
                              <Clock size={10} />
                              <span>
                                {signup.event_signup_form_data.available_from === "any" && signup.event_signup_form_data.available_to === "any"
                                  ? "Any Time"
                                  : `${getPrettyValueFromAvailability(signup.event_signup_form_data.available_from)} - ${getPrettyValueFromAvailability(signup.event_signup_form_data.available_to)}`
                                }
                              </span>
                            </small>
                          )}
                        </div>
                        <Button variant={"outline-secondary"} color={"primary"} size={"sm"} onClick={() => onSlotMoveSooner()}>
                            <ArrowUp />
                        </Button>
                        <Button variant={"outline-secondary"} size={"sm"} onClick={() => onSlotMoveLater()}>
                            <ArrowDown />
                        </Button>

                    </Stack>
                </span>
            </Col>
            <Col xs={{ order: 1, span: 6 }} md={{ order: 3, span: 2 }} lg={1}>
                <ActionMenu
                    className="mb-1 d-flex justify-content-end"
                    options={[
                        {
                            label: "Edit DJ",
                            onClick: () => {
                                window.open(`/djs/${slot.dj_ref.id}`, '_blank', 'noreferrer')?.focus();
                                // navigate(`/djs/${slot.dj_ref.id}`);
                            }
                        },
                        {
                            label: "Send Back to Signups",
                            onClick: () => { onRemoveSlot(); }
                        }]} />
            </Col>
            <Col xs={{ order: 2, span: 12 }} md={{ order: 2, span: true }} className="pt-3">
                <EventSlotDetails signup={signup} onUpdateSignup={onUpdateSignup} />
                < hr />
                {
                    !signup.dj_refs ? (
                        <p>No DJs available for this slot.</p>
                    ) : (
                        <>
                            {signup.dj_refs.map((djRef, index) => {
                                const dj = djRef && djCache.get(djRef.id);
                                if (!dj) return null; // Ensure the DJ exists

                                const avatarUrl = dj.discord_id
                                    ? `https://cdn.discordapp.com/avatars/${dj.discord_id}/0.png`
                                    : `https://cdn.discordapp.com/embed/avatars/0.png`; // Default avatar

                                console.log(`DJ ${index} from signup.dj_refs:`, {
                                    discord_id: dj.discord_id,
                                    avatarUrl,
                                }); // Debugging log

                                return (
                                    <DjDetails
                                        key={index}
                                        dj={{
                                            dj_name: dj.dj_name || "Unknown DJ",
                                            discord_id: dj.discord_id || "",
                                            public_name: dj.dj_name || "Unknown DJ",
                                            avatar: avatarUrl, // Pass the avatar URL
                                        }}
                                        djRef={djRef}
                                        djEvents={[]} // No events available for `signup.dj_refs`
                                    />
                                );
                            })}
                        </>
                    )
                }
            </Col>
        </Row>
    </Container>;
}

export default EventLineupSlot;