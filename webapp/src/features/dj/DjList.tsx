import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { Dj } from "../../util/types";
import { db } from "../../util/firebase";
import { Alert, AlertHeading, Breadcrumb, Button, Spinner, Stack, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { docToRawType } from "../../store/util";

type Props = {
    past?: boolean;
}

const DjList = ({ past = false}: Props) => {
    const [djs, setDjs] = useState<Dj[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        (async () => {
            const q = query(collection(db, "djs"));
            const querySnapshot = await getDocs(q);

            const djs: Dj[] = querySnapshot.docs
                .map((doc) => docToRawType<Dj>(doc))
                .filter((doc): doc is Exclude<typeof doc, null> => doc !== null);
            setDjs(djs ?? []);
            setLoading(false);
        })()
    }, [past]);

    if (loading) {
        return <Spinner />
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
            <Table>
                <thead>
                    <tr>
                        <th>Dj Name</th>
                        <th>Discord Name</th>
                    </tr>
                </thead>
                <tbody>
                    {djs.map(dj => <tr key={dj.id}>
                        <td><Link to={`/djs/${dj.id}`}>{dj.name}</Link></td>
                        <td>{dj.discord_username}</td>
                    </tr>)}
                </tbody>
            </Table>
        }
    </section>
}

export default DjList;