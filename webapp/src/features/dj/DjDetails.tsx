import React, { useEffect, useState } from "react";
import { Breadcrumb, Spinner } from "react-bootstrap";
import { useParams } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj } from "../../util/types";
import DjForm from "./DjForm";
import { Link } from "react-router-dom";
import { docToRawType } from "../../store/util";

const DjDetails = () => {


    const { djId } = useParams();
    const [ busy, setBusy ] = useState<boolean>(false);

    const [ dj, setDj ] = useState<Dj>({ 
        discord_username: "",
        dj_name: "",
     });

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

    if(busy) {
        return <Spinner />
    }

    return <div>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/djs">Djs</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/djs/${dj.id}`}>{dj.dj_name}</Link></Breadcrumb.Item>
        </Breadcrumb>
        <h2 className="display-6">Dj Details</h2>
        <DjForm dj={dj} onSubmitDj={()=>{}} busy={busy}/>
    </div>
}

export default DjDetails;
