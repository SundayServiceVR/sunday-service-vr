import { Modal } from "react-bootstrap"
import { Dj } from "../../util/types"
import { useState } from "react"
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

    const [busy, setBusy] = useState<boolean>(false);

    const createDj = (newDj: Dj) => {
        setBusy(true);
        (async () => {
            const documentRef = await addDoc(collection(db, "djs"), newDj);
            onDjCreated(newDj, documentRef);
            setBusy(false);
        })();
    }

    return <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>Create Dj</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <DjForm dj={defaultDj} onSubmitDj={createDj} busy={busy} onCancel={handleClose} />
        </Modal.Body>
        {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Close
        </Button>
        <Button variant="primary" onClick={() => createDj()}>
            Save Changes
        </Button>
        </Modal.Footer> */}
    </Modal>
}