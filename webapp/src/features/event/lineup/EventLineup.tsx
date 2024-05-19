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
    
    const addSlot = (slot: Slot) => {
        const slots_copy = [...eventScratchpad.slots, slot];
        proposeEventChange({...eventScratchpad, slots: slots_copy});
    }

    const addNewDjAsSlot = (newDj: Dj, documentRef: DocumentReference) => {
        const newSlot: Slot = {
            // djRecord: newDj,
            dj_ref: documentRef,
            dj_name: newDj.name ?? "",
            duration: 1,
            is_debut: false, // When more djs are added, we want to set this to true
        }
        setAddDjModalShow(false);
        addSlot(newSlot);
    }

    return <>
        <h3 className="display-6">Add DJs</h3>
        <Container>
            <Row>
                <Col md={8}>
                    <DjSearchSelect onDjSelect={dj => addSlot({
                        // djRecord: dj,
                        duration: 1,
                        rtmp_url: dj?.rtmp_url,
                        twitch_username: dj?.twitch_username
                    } as Slot)} />
                </Col>
                <Col className="d-flex justify-content-center">
                    <Button variant="primary" size="lg" onClick={() => setAddDjModalShow(true)}>Add a New DJ</Button>
                </Col>
            </Row>
        </Container>
        < hr />
        <div>
            <h3 className="display-6">Schedule</h3>
            <SortableDjList />
        </div>


        <CreateDjModal show={addDjModalShow} handleClose={() => setAddDjModalShow(false)} onDjCreated={addNewDjAsSlot} />

    </>;
};

export default EventLineup;
