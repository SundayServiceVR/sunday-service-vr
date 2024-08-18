import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap"
import { Dj } from "../../util/types"
import { FormEvent, useState } from "react"
// import DjForm from "./DjForm"
import { DocumentReference, addDoc, collection } from "firebase/firestore"
import { db } from "../../util/firebase"
import { DjSearchSelect } from "./DjSearchSelect"
import Spinner from "../../components/spinner"

type Props = {
    show: boolean,
    handleClose: () => void,
    onDjSelected: ( newDj: Dj, documentRef: DocumentReference ) => void,
}

export const SelectDjModal = ({ show, handleClose, onDjSelected }: Props) => {
    const defaultDj: Dj = {
        public_name: "",
        dj_name: "",
    }
    const [dj, setDj] = useState<Dj>(defaultDj);

    const [busy, setBusy] = useState<boolean>(false);

    const createDj = () => {
        setBusy(true);
        (async () => {
            const documentRef = await addDoc(collection(db, "djs"), dj);
            onDjSelected(dj, documentRef);
            setBusy(false);
        })();
    }

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        createDj();
        setDj(defaultDj);
    }

    return <Modal show={show} onHide={handleClose}>
            <Form onSubmit={onFormSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Dj</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    { busy && <Spinner type="simple"/>}

                    {
                        !busy &&
                        <Container>
                        <Row>
                            <Col md={8} className="pt-2">
                                <DjSearchSelect onDjSelect={(dj, ref) => { debugger; onDjSelected(dj, ref); }}/>
                            </Col>
                            <Col className="d-flex justify-content-center pt-2">
                                <Button variant="primary" size="lg" onClick={() => console.log("Todo: Return New DJ")}>Add a New DJ</Button>
                            </Col>
                        </Row>
                    </Container>
                    }
                    {/* <DjForm dj={dj} setDj={setDj} busy={busy} /> */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    {/* <Button variant="primary" type="submit">
                        Save Changes
                    </Button> */}
                </Modal.Footer>
            </Form>
        </Modal>
}