import React, { useState } from "react";
import DjForm from "./DjForm";
import { Breadcrumb } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj } from "../../util/types";

const CreateDj = () => {


    const defaultDj: Dj = { 
        discord_username: "",
        dj_name: "",
     };
    const [ busy, setBusy ] = useState<boolean>(false);
    const navigate = useNavigate();

    const onSubmit = (dj: Dj) => {
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
        <DjForm dj={defaultDj} onSubmitDj={onSubmit} busy={busy}/>
    </section>
}

export default CreateDj;
