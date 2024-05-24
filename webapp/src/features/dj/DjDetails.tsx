import { FormEvent, useEffect, useState } from "react";
import { Alert, Breadcrumb, Button, Form, Stack } from "react-bootstrap";
import { useParams } from "react-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj } from "../../util/types";
import DjForm from "./DjForm";
import { Link } from "react-router-dom";
import { docToRawType } from "../../store/util";

import Spinner from "../../components/spinner";

const DjDetails = () => {
    
    const { djId } = useParams();
    const [ busy, setBusy ] = useState<boolean>(false);
    const [ isEditing, setIsEditing ] = useState<boolean>(false);

    const [ dj, setDj ] = useState<Dj>({ 
        public_name: "",
        dj_name: "",
     });
     
    const [ djScratchpad, setDjScratchpad ] = useState<Dj>({...dj});

    useEffect(()=>{
        setBusy(true);
        (async () => {
            if(!djId) {
                setBusy(false);
                return;
            }
            const result = await getDoc(doc(db, "djs", djId));
            setDj(docToRawType<Dj>(result));
            setBusy(false);
        })();
    }, [djId]);

    const onSubmitDj = (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        (async () => {
            if(!djId) {
                throw(new Error("Attempted to update a dj with no id"))
            }
            const newDoc = doc(db, "djs", djId);
            await setDoc(newDoc, djScratchpad);
            setDj(djScratchpad);
            setBusy(false);
            setIsEditing(false);
        })();
    }
    const onCancelUpdate = () => {
        setDjScratchpad({...dj});
        setIsEditing(false);
    }

    if(busy) {
        return <Spinner type="logo" />
    }

    return <div>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/djs">Djs</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/djs/${djId}`}>{dj.dj_name}</Link></Breadcrumb.Item>
        </Breadcrumb>
        <h2 className="display-6">Dj Details</h2>
        { isEditing 
            ? <>
                    <Alert variant="info">
                        <Alert.Heading>Editing fields here will not affect any existing dj information in existing events.</Alert.Heading>
                        To edit event information as well, edit the dj information from the event
                    </Alert>
                    <Form onSubmit={onSubmitDj}>
                        <DjForm dj={djScratchpad} setDj={setDjScratchpad} busy={busy}/>
                        <Stack direction="horizontal" gap={3}>
                            <Button variant="primary" type="submit" className="mt-3">
                                Submit
                            </Button>
                            <Button variant="primary" onClick={onCancelUpdate} className="mt-3">
                                Cancel
                            </Button>
                        </Stack>
                    </Form>
                </>
            : <div>
                <dl>
                    <dt>Name</dt>
                    <dd>{ dj.public_name }</dd>
                    <dt>Dj Name</dt>
                    <dd>{ dj.dj_name }</dd>
                    <dt>Stream URL</dt>
                    <dd>{ dj.rtmp_url }</dd>
                    <dt>Twitch Username</dt>
                    <dd>{ dj.twitch_username }</dd>
                    <Button onClick={() => { setDjScratchpad({...dj}); setIsEditing(true); }}>Edit</Button>
                </dl>
            </div>
        }
    </div>
}

export default DjDetails;
