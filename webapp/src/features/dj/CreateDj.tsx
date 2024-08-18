import { FormEvent, useState } from "react";
import DjForm from "./DjForm";
import { Breadcrumb, Button, Form, Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj } from "../../util/types";

const CreateDj = () => {
    const defaultDj: Dj = { 
        discord_id: "",
        public_name: "",
        dj_name: "",
        rtmp_url: "",
        twitch_username: "",
     };

    const [dj, setDj] = useState<Dj>(defaultDj);

    const [ busy, setBusy ] = useState<boolean>(false);
    const navigate = useNavigate();

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        (async () => {
            const result = await addDoc(collection(db, "djs"), dj);
            navigate(`/djs/${result.id}`);
            setBusy(false);
        })();
    }

    return <section>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/djs">Djs</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/djs/create">Create</Link></Breadcrumb.Item>
        </Breadcrumb>
        <h2 className="display-6">Create Dj</h2>
        <Form onSubmit={onSubmit}>
            <DjForm dj={dj} setDj={setDj} busy={busy}/>
            <Stack direction="horizontal" gap={3}>
                <Button variant="primary" type="submit" className="mt-3">
                    Submit
                </Button>
            </Stack>
        </Form>
    </section>
}

export default CreateDj;
