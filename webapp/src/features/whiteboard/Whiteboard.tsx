import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Alert, AlertHeading, Spinner } from "react-bootstrap";

const Whiteboard = () => {
    const [result, setResult] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        setLoading(true);
        (async () => {
            try { 
                const docRef = doc(db, "whiteboards", "current");
                const docSnap = await getDoc(docRef);
                if(docSnap.exists()) {
                    setResult(docSnap.data().au)
                }
            } catch(error: any){
                setError(error.message ?? error.toString());
            } finally {
                setLoading(false);
            }

        })()
    }, []);

    if(loading) {
        return <div className="text-center"><Spinner /></div>
    }

    if(error) {
        return <Alert variant="warning"><AlertHeading>Error</AlertHeading>{error}</Alert>
    }

    // https://www.youtube.com/watch?v=2u6Zb36OQjM
    return <div>{ result ?? "No Results" }</div>
}

export default Whiteboard;