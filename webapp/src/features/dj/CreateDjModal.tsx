import { Button, Form, Modal } from "react-bootstrap"
import { Dj } from "../../util/types"
import { FormEvent, useState } from "react"
import DjForm from "./DjForm"
import { DocumentReference, addDoc, collection } from "firebase/firestore"
import { db } from "../../util/firebase"

type Props = {
    show: boolean,
    handleClose: () => void,
    onDjCreated: ( newDj: Dj, documentRef: DocumentReference ) => void,
}

export const CreateDjModal = ({ show, handleClose, onDjCreated }: Props) => {
    const defaultDj: Dj = {
        discord_username: "",
    }
    const [dj, setDj] = useState<Dj>(defaultDj);

    const [busy, setBusy] = useState<boolean>(false);

    const createDj = () => {
        setBusy(true);
        (async () => {
            const documentRef = await addDoc(collection(db, "djs"), dj);
            onDjCreated(dj, documentRef);
            setBusy(false);
        })();
    }

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        createDj();
    }

    return <Modal show={show} onHide={handleClose}>
            <Form onSubmit={onFormSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Dj</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <DjForm dj={dj} setDj={setDj} busy={busy} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
}