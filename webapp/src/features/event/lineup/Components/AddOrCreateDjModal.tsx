import { Button, Form, Modal, Stack } from "react-bootstrap"

import { FormEvent, useState } from "react"

import { DocumentReference } from "firebase/firestore"
import DjForm from "../../../dj/DjForm"
import { Dj } from "../../../../util/types"
import { createDj } from "../../../../store/dj"
import { DjSearchSelect } from "../../../dj/DjSearchSelect"


type Props = {
    show: boolean,
    handleClose: () => void,
    onDjSelected: (dj: Dj, dj_ref: DocumentReference) => void,
}

export const AddOrCreateDjModal = ({ show, handleClose, onDjSelected }: Props) => {
    const defaultDj: Dj = {
        dj_name: "",
        discord_id: "",
        public_name: "",
        events: [],
        notes: [],
    }
    const [dj, setDj] = useState<Dj>(defaultDj);

    const [busy, setBusy] = useState<boolean>(false);

    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        (async () => {
            const documentRef = await createDj(dj);
            onDjSelected(dj, documentRef);
            setBusy(false);
        })();
        setDj(defaultDj);
    }

    return <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Add Dj</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {
                !showCreateForm && <Stack direction="horizontal" gap={2}>
                    <div className="flex-grow-1">
                        <DjSearchSelect onDjSelect={onDjSelected} />
                    </div>
                    <div className="vr" />
                    <Button onClick={() => setShowCreateForm(true)}>Onboard New Dj</Button>
                </Stack>
            }
            {showCreateForm && <Form onSubmit={onFormSubmit}>
                <DjForm dj={dj} setDj={setDj} busy={busy} />
            </Form>
            }
        </Modal.Body>
        <Modal.Footer>
            {showCreateForm && <>
                <Button variant="secondary" onClick={() => setShowCreateForm(false)} >
                    Select Existing Dj
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" type="submit">
                    Save Changes
                </Button>
            </>
            }

        </Modal.Footer>
    </Modal>
}
