import { FormEvent, useState } from "react";
import DjForm from "./DjForm";
import { Button, Form, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Dj } from "../../util/types";
import { createDj } from "../../store/dj";
import { toast } from "react-hot-toast";

const CreateDj = () => {
    const defaultDj: Dj = { 
        discord_id: "",
        public_name: "",
        dj_name: "",
        rtmp_url: "",
        twitch_username: "",
        events: [],
        notes: [],
     };

    const [dj, setDj] = useState<Dj>(defaultDj);

    const [ busy, setBusy ] = useState<boolean>(false);
    const navigate = useNavigate();

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        (async () => {
            try {
                const result = await createDj(dj);
                navigate(`/djs/${result.id}`);
            } catch (error) {
                toast.error(`An error occurred while creating the DJ.: ${(error as Error).message ?? "Unknown error"}`);
            } finally {
                setBusy(false);
            }
        })();
    }

    return <section>
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
