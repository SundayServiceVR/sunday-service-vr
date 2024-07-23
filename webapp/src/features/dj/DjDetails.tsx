import { FormEvent, useEffect, useState } from "react";
import { Alert, Breadcrumb, Button, Col, Container, Form, ListGroup, ListGroupItem, Row, Stack } from "react-bootstrap";
import { useParams } from "react-router";
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj, Event } from "../../util/types";
import DjForm from "./DjForm";
import { Link } from "react-router-dom";
import { docToRawType } from "../../store/util";

import Spinner from "../../components/spinner";
import { docToEvent } from "../../store/converters";

const DjDetails = () => {
    
    const { djId } = useParams();
    const [ busy, setBusy ] = useState<boolean>(false);
    const [ isEditing, setIsEditing ] = useState<boolean>(false);

    const [ dj, setDj ] = useState<Dj>({ 
        public_name: "",
        dj_name: "",
     });

    const [ playedEvents, setPlayedEvents ] = useState<Event[]>([]);
     
    const [ djScratchpad, setDjScratchpad ] = useState<Dj>({...dj});

    useEffect(()=>{
        setBusy(true);
        (async () => {
            if(!djId) {
                setBusy(false);
                return;
            }
            const djReference = doc(db, "djs", djId);
            const result = await getDoc(djReference);
            setDj(docToRawType<Dj>(result));
            const playsQuery = query(collection(db, "events"), where("dj_plays", "array-contains", djReference), orderBy("start_datetime", "desc"));
            const playsQuerySnapshot = await getDocs(playsQuery);
            const playedEvents = playsQuerySnapshot.docs.map(doc => docToEvent(doc)).filter(event => event !== null) as Event[];
            setPlayedEvents(playedEvents)
            setBusy(false);
        })();
    }, [djId]);

    const onSubmitDj = (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        (async () => {
            if(!djId) {
                throw(new Error("Attempted to update a dj with no id"))
            }
            const newDoc = doc(db, "djs", djId);
            await setDoc(newDoc, djScratchpad);
            setDj(djScratchpad);
            setBusy(false);
            setIsEditing(false);
        })();
    }
    const onCancelUpdate = () => {
        setDjScratchpad({...dj});
        setIsEditing(false);
    }

    if(busy) {
        return <Spinner type="logo" />
    }

    return <div>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/djs">Djs</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/djs/${djId}`}>{dj.dj_name}</Link></Breadcrumb.Item>
        </Breadcrumb>
        <Container>
            <Row className="justify-content-md-center">
                <Col md={4}>
                    <h3>Dj Details</h3>
                    { isEditing 
                        ? <>
                                <Alert variant="info">
                                    <Alert.Heading>Editing fields here will not affect any existing dj information in existing events.</Alert.Heading>
                                    To edit event information as well, edit the dj information from the event
                                </Alert>
                                <Form onSubmit={onSubmitDj}>
                                    <DjForm dj={djScratchpad} setDj={setDjScratchpad} busy={busy}/>
                                    <Stack direction="horizontal" gap={3}>
                                        <Button variant="primary" type="submit" className="mt-3">
                                            Submit
                                        </Button>
                                        <Button variant="primary" onClick={onCancelUpdate} className="mt-3">
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Form>
                            </>
                        : <div>
                            <dl>
                                <dt>Name</dt>
                                <dd>{ dj.public_name }</dd>
                                <dt>Dj Name</dt>
                                <dd>{ dj.dj_name }</dd>
                                <dt>Stream URL</dt>
                                <dd>{ dj.rtmp_url }</dd>
                                <dt>Twitch Username</dt>
                                <dd>{ dj.twitch_username }</dd>
                                <Button onClick={() => { setDjScratchpad({...dj}); setIsEditing(true); }}>Edit</Button>
                            </dl>
                        </div>
                    }
                </Col>
                <Col md={4}>
                <h3>Plays ({playedEvents.length})</h3>
                    <ListGroup>
                        { playedEvents.map(event => <ListGroupItem><Link to={`/events/${event.id}`}>{event.name} - {event.start_datetime.toLocaleDateString()}</Link></ListGroupItem>) }
                    </ListGroup>
                </Col>
            </Row>
        </Container>
        


    </div>
}

export default DjDetails;
