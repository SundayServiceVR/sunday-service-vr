import React, { useState } from "react";
import { Card, CardBody, CardFooter, Button, Form } from "react-bootstrap";
import { getAusPasteMessage, getUkPasteMessage } from "../../util/messageWriters";
import { Event } from "../../util/types";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../util/firebase";


type Props = {
    event: Event;
}

const WhiteboardWriter = ({ event }: Props) => {

    const [buttonMsg, setButtonMsg] = useState<string>("Update Boards");
    const [buttonEnabled, setButtonEnabled] = useState<boolean>(true);

    const message = getUkPasteMessage(event);

    const updateWhiteboards = () => {
        (async () => {
            await updateDoc(doc(db, "whiteboards", "current"), {
                au: getAusPasteMessage(event),
                gmt: getUkPasteMessage(event),
            });
            setButtonMsg("Updated");
            setButtonEnabled(false);
            setTimeout(() => {
                setButtonMsg("Update Boards");
                setButtonEnabled(true);
            }, 4000)
            
        })();
    }

    return <div>
        <p>Lets try... pressing this button should affect in-game after in-world reload.</p>
        <Card>
            <CardBody>
                <Form.Control as="textarea" value={message} rows={16} readOnly className="has-fixed-size" />
            </CardBody>
            <CardFooter className="d-grid gap-2">
                <Button color={"primary"} onClick={updateWhiteboards} disabled={!buttonEnabled}>{buttonMsg}</Button>
            </CardFooter>
        </Card>
    </div>
}

export default WhiteboardWriter;