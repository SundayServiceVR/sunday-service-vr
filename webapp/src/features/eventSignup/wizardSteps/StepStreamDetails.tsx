import React from "react";
import { Container, Form, InputGroup, Button } from "react-bootstrap";
import { EventSignupFormData, Event } from "../../../util/types";
import { normalizeVrcdnLink, normalizeStreamLink } from "../utils/linkNormalization";


interface Step3Props {
  formData: EventSignupFormData;
  onChange: (e: React.ChangeEvent<HTMLElement>) => void;
  event?: Event;
  priorStreamLinks?: string[];
}

const EventSignupStep3: React.FC<Step3Props> = ({ formData, onChange, event, priorStreamLinks = [] }) => {
  const isLiveJive = event?.signup_configuration?.isLiveJive || false;
  
  // If this is a livejive event and the user previously selected PRERECORD, 
  // we need to clear that selection
  React.useEffect(() => {
    if (isLiveJive && formData.type === "PRERECORD") {
      // Create a synthetic event to clear the prerecord selection
      const syntheticEvent = {
        target: {
          name: "type",
          value: "",
          type: "select-one"
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  }, [isLiveJive, formData.type, onChange]);
  
  return (
    <>
      <h5>Stream Details</h5>
      {isLiveJive && (
        <div className="alert alert-info">
          <strong>Live Jive Event:</strong> This is a Live Jive event - only live performances are allowed!
        </div>
      )}
      <Container className="mt-3">

        <Form.Group className="mb-3" controlId="type">
          <Form.Label>Live or Prerecord</Form.Label>
          <Form.Select name="type" value={formData.type || ""} onChange={onChange} required>
            <option value=""/>
            <option value="LIVE">Live</option>
            {!isLiveJive && <option value="PRERECORD">Prerecord</option>}
          </Form.Select>
        </Form.Group>
        { formData.type === "LIVE" && (
          <Form.Group className="mb-3" controlId="stream_link">
            <Form.Label>Stream Link</Form.Label>

            {typeof formData.stream_link === "string" && formData.stream_link.startsWith("vrcdn:") ? (
              <InputGroup>
                <InputGroup.Text id="vrcdn-prefix">vrcdn:</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="VRCDN username"
                  aria-describedby="vrcdn-prefix"
                  value={formData.stream_link.replace(/^vrcdn:/, "")}
                  onChange={(e) => {
                    const username = e.target.value;
                    const syntheticEvent = {
                      target: {
                        name: "stream_link",
                        value: username ? `vrcdn:${username}` : "",
                        type: "text",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                  }}
                  onBlur={(e) => {
                    const fullValue = e.target.value ? `vrcdn:${e.target.value}` : "";
                    const normalized = normalizeVrcdnLink(fullValue);
                    if (normalized && normalized !== fullValue) {
                      const syntheticEvent = {
                        target: {
                          name: "stream_link",
                          value: normalized,
                          type: "text",
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      onChange(syntheticEvent);
                    }
                  }}
                  required
                  style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: "0.95rem" }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    const syntheticEvent = {
                      target: {
                        name: "stream_link",
                        value: "",
                        type: "text",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                  }}
                >
                  Clear
                </Button>
              </InputGroup>
            ) : typeof formData.stream_link === "string" && formData.stream_link.startsWith("twitch:") ? (
              <InputGroup>
                <InputGroup.Text id="twitch-prefix">twitch.tv/</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-label="Twitch username"
                  aria-describedby="twitch-prefix"
                  value={formData.stream_link.replace(/^twitch:/, "")}
                  onChange={(e) => {
                    const username = e.target.value;
                    const syntheticEvent = {
                      target: {
                        name: "stream_link",
                        value: username ? `twitch:${username}` : "",
                        type: "text",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                  }}
                  required
                  style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: "0.95rem" }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    const syntheticEvent = {
                      target: {
                        name: "stream_link",
                        value: "",
                        type: "text",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                  }}
                >
                  Clear
                </Button>
              </InputGroup>
            ) : (
              <Form.Control
                type="url"
                name="stream_link"
                placeholder="Enter your stream link (VRCDN, Twitch, etc.)"
                value={formData.stream_link || ""}
                onChange={onChange}
                onBlur={(e) => {
                  const normalized = normalizeStreamLink(e.target.value);
                  if (normalized && normalized !== e.target.value) {
                    const syntheticEvent = {
                      target: {
                        name: "stream_link",
                        value: normalized,
                        type: "url",
                      },
                    } as unknown as React.ChangeEvent<HTMLElement>;
                    onChange(syntheticEvent);
                  }
                }}
                required
              />
            )}

            {typeof formData.stream_link === "string" && formData.stream_link.startsWith("vrcdn:") && (
              <Form.Text className="text-muted d-block mt-1">
                We detected you are streaming to VRCDN. Your stream link is set to
                {" "}
                <code>{formData.stream_link}</code>
                {" "}
                so hosts can make sure they are getting the correct url formats in our backend.
              </Form.Text>
            )}
            {typeof formData.stream_link === "string" && formData.stream_link.startsWith("twitch:") && (
              <Form.Text className="text-muted d-block mt-1">
                We detected you are using Twitch. Your stream link is set to
                {" "}
                <code>{formData.stream_link}</code>
                {" "}
                so hosts can make sure they are getting the correct url formats in our backend.
              </Form.Text>
            )}
          {priorStreamLinks.length > 0 && (
            <div className="mt-2">
              <div className="mb-1 fw-semibold">Previously used links</div>
              <div className="d-flex flex-wrap gap-2">
                {priorStreamLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    aria-label={`Use previously used link ${link}`}
                    onClick={() => {
                      const normalized = normalizeStreamLink(link) || link;
                      const syntheticEvent = {
                        target: {
                          name: "stream_link",
                          value: normalized,
                          type: "text",
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      onChange(syntheticEvent);
                    }}
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Form.Group>
      )}
      </Container>
    </>
  );
};

export default EventSignupStep3;
