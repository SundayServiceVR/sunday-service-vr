import { useEffect, useState } from "react";
import { DocumentReference, collection, getDocs, query } from "firebase/firestore";
import { Dj } from "../../util/types";
import { db } from "../../util/firebase";
import { Alert, AlertHeading, Breadcrumb, Button, Stack, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { docToRawType } from "../../store/util";

import Spinner from "../../components/spinner";

type Props = {
    past?: boolean;
}

const DjList = ({ past = false}: Props) => {
    const [djs, setDjs] = useState<{ dj: Dj, reference: DocumentReference}[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        (async () => {
            const q = query(collection(db, "djs"));
            const querySnapshot = await getDocs(q);

            const djs: { dj: Dj, reference: DocumentReference}[] = querySnapshot.docs
                .map((doc) => ({dj: docToRawType<Dj>(doc), reference: doc.ref}));
            setDjs(djs ?? []);
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

        { djs.length <= 0 && <Alert variant="warning"><AlertHeading>No Djs Found</AlertHeading>Should we add a dj?</Alert> }

        { djs.length > 0 &&
            <Table responsive="sm">
                <thead>
                    <tr>
                        <th>Dj Name</th>
                        <th>Discord Name</th>
                        <th>VRCDN/RTMP</th>
                        <th>Twitch Username</th>
                    </tr>
                </thead>
                <tbody>
                    {djs.map(entry => <tr key={entry.reference.id}>
                        <td><Link to={`/djs/${entry.reference.id}`}>{entry.dj.dj_name ?? "(No Dj Name)"}</Link></td>
                        <td>{entry.dj.public_name}</td>
                        <td>{entry.dj.rtmp_url}</td>
                        <td>{entry.dj.twitch_username}</td>
                    </tr>)}
                </tbody>
            </Table>
        }
    </section>
}

export default DjList;