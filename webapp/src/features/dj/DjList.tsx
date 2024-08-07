import { useEffect, useState } from "react";
import { DocumentReference, collection, getDocs, orderBy, query } from "firebase/firestore";
import { Dj, Event } from "../../util/types";
import { db } from "../../util/firebase";
import { Alert, AlertHeading, Breadcrumb, Button, Stack, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { docToRawType } from "../../store/util";

import Spinner from "../../components/spinner";
import { getAllEvents } from "../../store/events";

type Props = {
    past?: boolean;
}

type DjMap = Map<string, { dj: Dj, reference: DocumentReference, events: Event[]}>;

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

const DjList = ({ past = false}: Props) => {
    const [djs, setDjs] = useState<DjMap>( new Map());
    const [loading, setLoading] = useState<boolean>(false);
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

            setDjs(djMap);
            setLoading(false);
        })()
    }, [past]);

    if (loading) {
        return <Spinner type="logo" />
    }

    return <section>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/djs">Djs</Link></Breadcrumb.Item>
        </Breadcrumb>
        <Stack direction="horizontal" gap={3}>
            <span className="me-auto" />
            <Button variant="primary" onClick={()=>navigate("/djs/create")}>Create Dj</Button>
        </Stack>

        { djs.size <= 0 && <Alert variant="warning"><AlertHeading>No Djs Found</AlertHeading>Should we add a dj?</Alert> }

        { djs.size > 0 &&
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th>Dj Name</th>
                        <th>Discord Name</th>
                        <th>VRCDN/RTMP</th>
                        <th>Twitch Username</th>
                        <th>Total Plays</th>
                        <th>Most Recent Play</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from(djs.values()).map((entry) => <tr key={entry.reference.id}>
                        <td><Link to={`/djs/${entry.reference.id}`}>{entry.dj.dj_name ?? "(No Dj Name)"}</Link></td>
                        <td>{entry.dj.public_name}</td>
                        <td>{entry.dj.rtmp_url}</td>
                        <td>{entry.dj.twitch_username}</td>
                        <td>{entry.events.length}</td>
                        <td>{entry.events[0]?.start_datetime.toLocaleDateString() ?? "-"}</td>
                    </tr>)}
                </tbody>
            </Table>
        }
    </section>
}

export default DjList;