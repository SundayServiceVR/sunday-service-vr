import { useEffect, useState } from "react";
import { DocumentReference, collection, getDocs, orderBy, query } from "firebase/firestore";
import { Dj, Event } from "../../util/types";
import { db } from "../../util/firebase";
import { Alert, AlertHeading, Button, Col, Container, Form, InputGroup, Row, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { docToRawType } from "../../store/util";

import Spinner from "../../components/spinner/Spinner";
import { getAllEvents } from "../../store/events";

type Props = {
    past?: boolean;
}

type DjMapEntry = { dj: Dj, reference: DocumentReference, events: Event[] }

type DjMap = Map<string, DjMapEntry>;

async function fetchDjs() {
    const q = query(collection(db, "djs"), orderBy("dj_name"));
    const querySnapshot = await getDocs(q);

    const djs: DjMap = new Map(querySnapshot.docs
        .map((doc) => [
            doc.ref.id,
            {
                dj: docToRawType<Dj>(doc),
                reference: doc.ref,
                events: []
            }
        ]));
    return djs ?? [];
}

async function fetchData() {
    const fetchDjsTask = fetchDjs();
    const fetchEventsTask = getAllEvents("desc");

    return {
        djs: await fetchDjsTask,
        events: await fetchEventsTask,
    }
}

const DjList = ({ past = false }: Props) => {
    const [djs, setDjs] = useState<DjMap>(new Map());
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [earliestEvent, setEarliestEvent] = useState<Event>();
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        (async () => {
            const { djs: djMap, events } = await fetchData();

            events.forEach(event => {
                event.dj_plays.forEach(djRef => {
                    djMap.get(djRef.id)?.events.push(event);
                })
            });
            setEarliestEvent(events[events.length - 1] ?? null);
            setDjs(djMap);
            setLoading(false);
        })()
    }, [past]);

    if (loading) {
        return <Spinner type="logo" />
    }

    const djSearchFilter = ((entry: DjMapEntry) => {
        return entry.dj.dj_name.toLowerCase().includes(searchTerm.toLowerCase()) 
            || entry.dj.public_name.toLowerCase().includes(searchTerm.toLowerCase())
    })

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
                    {Array.from(djs.values()).filter(dj => djSearchFilter(dj)).map((entry) => <tr key={entry.reference.id}>
                        <td><Link to={`/djs/${entry.reference.id}`}>{entry.dj.dj_name ?? "(No Dj Name)"}</Link></td>
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