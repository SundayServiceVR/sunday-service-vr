import { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Row, Col, Spinner, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import { fetchWhiteboardContents, WhiteboardContents } from '../../../util/whiteboard';

type Props = {
    show: boolean;
    onHide: () => void;
};

const revoke = (contents: WhiteboardContents | null) => {
    if (contents) {
        URL.revokeObjectURL(contents.lineupPosterUrl);
        URL.revokeObjectURL(contents.hostPosterUrl);
    }
};

const PosterCard = ({ title, src }: { title: string; src: string }) => (
    <Card className="h-100">
        <Card.Header>{title}</Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center bg-light p-2">
            <img
                src={src}
                alt={title}
                className="img-fluid"
                style={{ maxHeight: '60vh', objectFit: 'contain' }}
            />
        </Card.Body>
    </Card>
);

const TimesCard = ({ title, text }: { title: string; text: string }) => (
    <Card className="h-100">
        <Card.Header>{title}</Card.Header>
        <Card.Body>
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</pre>
        </Card.Body>
    </Card>
);

export const WhiteboardPreviewModal = ({ show, onHide }: Props) => {
    const [contents, setContents] = useState<WhiteboardContents | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setContents(await fetchWhiteboardContents());
            setLastRefreshed(new Date());
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (show) {
            refresh();
        }
    }, [show, refresh]);

    useEffect(() => () => revoke(contents), [contents]); // Revokes the previous URLs on change/unmount

    return (
        <Modal show={show} onHide={onHide} size="xl" fullscreen="md-down" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    Current Whiteboard
                    {lastRefreshed && (
                        <div className="text-muted fs-6 fw-normal">
                            Updated {lastRefreshed.toLocaleTimeString()}
                        </div>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {!contents && loading && (
                    <div className="text-center py-5"><Spinner animation="border" /></div>
                )}

                {contents && (
                    <Tabs defaultActiveKey="posters" className="mb-3" fill>
                        <Tab eventKey="posters" title="Posters">
                            <Row className="g-3">
                                <Col xs={12} md={6}>
                                    <PosterCard title="Lineup poster" src={contents.lineupPosterUrl} />
                                </Col>
                                <Col xs={12} md={6}>
                                    <PosterCard title="Host poster" src={contents.hostPosterUrl} />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="times" title="Times">
                            <Row className="g-3">
                                <Col xs={12} md={6}>
                                    <TimesCard title="GMT" text={contents.gmt} />
                                </Col>
                                <Col xs={12} md={6}>
                                    <TimesCard title="AU" text={contents.au} />
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={refresh} disabled={loading}>
                    {loading && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                    Refresh
                </Button>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};
