import { FormEvent, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, ListGroup, ListGroupItem, Row, Stack } from "react-bootstrap";
import { useParams } from "react-router";
import { Dj } from "../../util/types";
import DjForm from "./DjForm";
import { Link } from "react-router-dom";

import Spinner from "../../components/spinner/Spinner";
import { updateDj } from "../../store/dj";
import toast from "react-hot-toast";
import { useDjWithEvents } from "../../contexts/useEventDjCache/useDjWithEvents";
import { getDjStreamLinks } from "../../store/djViewModel";

const DjDetails = () => {
    const { djId } = useParams();
    const { dj, events: playedEvents, loading } = useDjWithEvents(djId);

    const [ busy, setBusy ] = useState<boolean>(false);
    const [ isEditing, setIsEditing ] = useState<boolean>(false);
    const [ djScratchpad, setDjScratchpad ] = useState<Dj | null>(null);

    useEffect(() => {
        if (dj) {
            setDjScratchpad(dj);
        }
    }, [dj]);

    const onSubmitDj = (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        (async () => {
            try {
                if(!djId || !djScratchpad) {
                    throw(new Error("Attempted to update a dj with no id or data"));
                }
                await updateDj(djId, djScratchpad);
                setIsEditing(false);
            } catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    toast(`Error: ${error.message}`);
                } else {
                    toast(`Error: ${String(error)}`);
                }
            } finally {
                setBusy(false);
            }
        })();
    };

    const onCancelUpdate = () => {
        if (dj) {
            setDjScratchpad({ ...dj });
        }
        setIsEditing(false);
    };

    if(loading || busy || !dj || !djScratchpad) {
        return <Spinner type="logo" />;
    }

    const streamLinks = getDjStreamLinks(dj, playedEvents);

    return <div>
        <Container>
            <Row className="justify-content-md-center">
                <Col md={4}>
                    <h3 className="display-6">Dj Details</h3>
                    { isEditing 
                        ? <>
                                <Alert variant="info">
                                    <Alert.Heading>Editing fields here will not affect any existing dj information in existing events.</Alert.Heading>
                                    To edit event information as well, edit the dj information from the event
                                </Alert>
                                <Form onSubmit={onSubmitDj}>
                                    <DjForm dj={djScratchpad} setDj={setDjScratchpad as React.Dispatch<React.SetStateAction<Dj>>} busy={busy}/>
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
                                <dt>Discord ID</dt>
                                <dd>{ dj.discord_id }</dd>

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

                            <a href={`https://discord.com/users/${dj.discord_id}`} target="_blank" rel="noreferrer">View Discord Profile</a>
                        </div>
                    }
                </Col>
                <Col md={4}>
                    <h3 className="display-6">Plays ({playedEvents.length})</h3>
                    <ListGroup>
                        { playedEvents.map(event => <ListGroupItem key={event.id}><Link to={`/events/${event.id}`}>{event.name} - {event.start_datetime.toLocaleDateString()}</Link></ListGroupItem>) }
                    </ListGroup>

                    <h3 className="display-6 mt-4">Stream Links Used</h3>
                    { streamLinks.length === 0 && <p className="text-muted">No stream links recorded from signups.</p> }
                    { streamLinks.length > 0 && (
                        <ListGroup className="mt-2">
                            { streamLinks.map((link, index) => (
                                <ListGroupItem key={index}>
                                    <a href={link} target="_blank" rel="noreferrer">{link}</a>
                                </ListGroupItem>
                            )) }
                        </ListGroup>
                    )}
                </Col>
            </Row>
        </Container>

    </div>;
};

export default DjDetails;
