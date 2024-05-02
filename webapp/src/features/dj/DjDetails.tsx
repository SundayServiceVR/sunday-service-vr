import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Spinner } from "react-bootstrap";
import { useParams } from "react-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj } from "../../util/types";
import DjForm from "./DjForm";
import { Link } from "react-router-dom";
import { docToRawType } from "../../store/util";

const DjDetails = () => {
    
    const { djId } = useParams();
    const [ busy, setBusy ] = useState<boolean>(false);
    const [ isEditing, setIsEditing ] = useState<boolean>(false);

    const [ dj, setDj ] = useState<Dj>({ 
        discord_username: "",
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

    const onSubmitDj = (newDj: Dj) => {
        setBusy(true);
        (async () => {
            if(!newDj.id) {
                throw(new Error("Attempted to update a dj with no id"))
            }
            const newDoc = doc(db, "djs", newDj.id);
            await setDoc(newDoc, newDj);
            setDj(newDj);
            setBusy(false);
            setIsEditing(false);
        })();
    }
    const onCancelUpdate = () => {
        setDjScratchpad({...dj});
        setIsEditing(false);
    }

    if(busy) {
        return <Spinner />
    }

    return <div>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/djs">Djs</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/djs/${dj.id}`}>{dj.dj_name}</Link></Breadcrumb.Item>
        </Breadcrumb>
        <h2 className="display-6">Dj Details</h2>
        { isEditing 
        ? <DjForm dj={djScratchpad} onSubmitDj={onSubmitDj} busy={busy} onCancel={onCancelUpdate}/>
        : <div>
            <dl>
                <dt>Dj Name</dt>
                <dd>{ dj.dj_name }</dd>
                <dt>Discord Username</dt>
                <dd>{ dj.discord_username }</dd>
                <dt>Stream URL</dt>
                <dd>{ dj.stream_url }</dd>
                <dt>Twitch URL</dt>
                <dd>{ dj.twitch_url }</dd>
                <Button onClick={() => { setDjScratchpad({...dj}); setIsEditing(true); }}>Edit</Button>
            </dl>
        </div>
        }
    </div>
}

export default DjDetails;
