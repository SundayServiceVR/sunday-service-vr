import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Dj, Slot } from "../../../util/types";
import { useEventOperations } from "../outletContext";
import SortableDjList from "./SortableDjList";
import { DjSearchSelect } from "../../dj/DjSearchSelect";
import { CreateDjModal } from "../../dj/CreateDjModal";
import { DocumentReference } from "firebase/firestore";

const EventLineup = () => {

    const [ eventScratchpad, proposeEventChange ] = useEventOperations();

    return <>
        <h3 className="display-6">Event Stream Links</h3>
        <Container>
            { eventScratchpad.slots.map(slot) => 
                <Row>
                    <Col className="d-flex justify-content-center pt-2">
                        {/* <Button variant="primary" size="lg" onClick={() => setAddDjModalShow(true)}>Add a New DJ</Button> */}
                    </Col>
                </Row>
            }

        </Container>
        < hr />
        <div>
            <h3 className="display-6">Schedule (Local Times)</h3>
            <SortableDjList />
        </div>

    </>;
};

export default EventLineup;
