import { useEffect, useState } from "react";
import { DocumentReference } from "firebase/firestore";
import { Dj, Event as AppEvent } from "../../util/types";
import { Alert, AlertHeading, Button, Col, Container, Form, InputGroup, Row, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import Spinner from "../../components/spinner/Spinner";
import toast from "react-hot-toast";
import { useEventDjCache } from "../../contexts/useEventDjCache";

type Props = {
    past?: boolean;
}

type DjMapEntry = { dj: Dj, reference: DocumentReference, events: AppEvent[] }

type DjMap = Map<string, DjMapEntry>;

const DjList = ({ past = false }: Props) => {
    const { djCache, eventCache, loading, getEventsByDjId } = useEventDjCache();

    const [djs, setDjs] = useState<DjMap>(new Map());
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [earliestEvent, setEarliestEvent] = useState<AppEvent>();
    const navigate = useNavigate();

    useEffect(() => {
        try {
            // Build DjMap from cache
            const djMap: DjMap = new Map();

            djCache.forEach((dj, id) => {
                djMap.set(id, {
                    dj,
                    reference: dj.events?.[0] as DocumentReference, // Best-effort reference
                    events: getEventsByDjId(id),
                });
            });

            setDjs(djMap);

            // Compute earliest event (by date) from eventCache, honoring `past` filter
            const allEvents = Array.from(eventCache.values());
            const filtered = past
                ? allEvents.filter(e => e.start_datetime < new Date())
                : allEvents.filter(e => e.start_datetime >= new Date());

            const sorted = filtered.sort((a, b) => a.start_datetime.getTime() - b.start_datetime.getTime());
            setEarliestEvent(sorted[0]);
        } catch (error) {
            toast.error("Problem loading djs.  Please yell at windy in the coordination channel.");
            throw error; // Rethrow to surface to error boundary
        }
    }, [djCache, eventCache, getEventsByDjId, past]);

    const djSearchFilter = ((entry: DjMapEntry) => {
        return entry.dj.dj_name.toLowerCase().includes(searchTerm.toLowerCase()) 
            || entry.dj.public_name.toLowerCase().includes(searchTerm.toLowerCase())
    });

    if (loading) {
        return <Spinner type="logo" />
    }

    return <section>
        <h2 className="display-6">Dj Roster</h2>

        {djs.size <= 0 && <Alert variant="warning"><AlertHeading>No Djs Found</AlertHeading>Should we add a dj?</Alert>}

        {djs.size > 0 && <>
            <Container>
                <Row>
                    <Col className="text-right mb-2">
                        <small>{djs.size} Total Djs</small>
                        <br />
                        <small>Earliest Recorded Event: {earliestEvent?.start_datetime.toLocaleDateString() ?? "None"}</small>
                    </Col>
                </Row>
                <Row className="text-end">

                <Col md={{span: 6, order: 1}} className="py-1 d-grid d-md-inline">
                        <span className="me-auto" />
                        <Button variant="primary" onClick={() => navigate("/djs/create")}>Create Dj</Button>
                    </Col>
                    <Col md={{span: 6, order: 0}} className="py-1">
                        <Form>
                            <InputGroup>
                                <Form.Control aria-label="Search DJ" placeholder="Search DJ" onChange={event => setSearchTerm(event.target.value)} />
                            </InputGroup>
                        </Form>
                    </Col>

                </Row>
            </Container>

            <Table responsive="sm" striped>
                <thead>
                    <tr>
                        <th>Dj Name</th>
                        <th>Alt Name</th>
                        <th>Discord ID</th>
                        <th>Total Plays</th>
                        <th>Most Recent Play</th>
                        <th>VRCDN/RTMP</th>
                        <th>Twitch Username</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from(djs.values()).filter(dj => djSearchFilter(dj)).map((entry) => <tr key={entry.reference?.id ?? entry.dj.discord_id}>
                        <td><Link to={`/djs/${entry.reference?.id ?? ""}`}>{entry.dj.dj_name ?? "(No Dj Name)"}</Link></td>
                        <td>{entry.dj.public_name}</td>
                        <td>{entry.dj.discord_id}</td>
                        <td>{entry.events.length}</td>
                        <td>{entry.events[0]?.start_datetime.toLocaleDateString() ?? "-"}</td>
                        <td>{entry.dj.rtmp_url}</td>
                        <td>{entry.dj.twitch_username}</td>
                    </tr>)}
                </tbody>
            </Table> 
        </>
        }
    </section>
}

export default DjList;