import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Dj, Slot } from "../../../util/types";
import { useEventOperations } from "../EventRoot";
import SortableDjList from "./SortableDjList";
import { DjSearchSelect } from "../../dj/DjSearchSelect";
import { CreateDjModal } from "../../dj/CreateDjModal";
import { DocumentReference } from "firebase/firestore";

const EventLineup = () => {

    const [ eventScratchpad, proposeEventChange ] = useEventOperations();
    const [ addDjModalShow, setAddDjModalShow ] = useState<boolean>(false);

    const addNewDjAsSlot = (newDj: Dj, documentRef: DocumentReference) => {
        const slot: Slot = {
            dj_ref: documentRef,
            dj_name: newDj.dj_name ?? "",
            rtmp_url: newDj.rtmp_url,
            twitch_username: newDj.twitch_username,
            duration: 1,
            is_debut: false,
        }
        setAddDjModalShow(false);
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    return <>
        <h3 className="display-6">Add DJs</h3>
        <Container>
            <Row>
                <Col md={8} className="pt-2">
                    <DjSearchSelect onDjSelect={addNewDjAsSlot}/>
                </Col>
                <Col className="d-flex justify-content-center pt-2">
                    <Button variant="primary" size="lg" onClick={() => setAddDjModalShow(true)}>Add a New DJ</Button>
                </Col>
            </Row>
        </Container>
        < hr />
        <div>
            <h3 className="display-6">Schedule (Local Times)</h3>
            <SortableDjList />
        </div>


        <CreateDjModal show={addDjModalShow} handleClose={() => setAddDjModalShow(false)} onDjCreated={addNewDjAsSlot} />

    </>;
};

export default EventLineup;
