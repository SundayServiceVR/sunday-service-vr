import React from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useBingoHost } from './hooks';

const BingoHost: React.FC = () => {
    const {
        currentGame,
        valuesInput,
        hardcoreMode,
        isLoading,
        error,
        setValuesInput,
        setHardcoreMode,
        createGame,
        drawValue,
        endGame,
        getLastDrawnValue,
    } = useBingoHost();

    return (
        <Container className="py-4">
            {/* Navigation */}
            <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                    <Nav.Link as={Link} to="/bingo">
                        Player View
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/bingo/host" className="active">
                        Host Console
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <Card.Header>
                            <h2 className="mb-0">Bingo Host Console</h2>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}

                            {(!currentGame || currentGame.state === 'ended') && (
                                <div className="mb-4">
                                    <h4>Start New Bingo Game</h4>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Bingo Values (comma-separated, minimum 25)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            value={valuesInput}
                                            onChange={(e) => setValuesInput(e.target.value)}
                                            placeholder="B1, B2, B3, I16, I17, N31, N32, G46, G47, O61, O62, ..."
                                            defaultValue={'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z'}
                                            disabled={isLoading}
                                        />
                                        <Form.Text className="text-muted">
                                            Enter at least 25 values separated by commas. These will be randomly distributed to player cards.
                                        </Form.Text>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            id="hardcore-mode"
                                            label="Hardcore Mode"
                                            checked={hardcoreMode}
                                            onChange={(e) => setHardcoreMode(e.target.checked)}
                                            disabled={isLoading}
                                        />
                                        <Form.Text className="text-muted">
                                            In Hardcore Mode, players who submit a false bingo are locked out and cannot submit again.
                                        </Form.Text>
                                    </Form.Group>
                                    <Button 
                                        variant="primary" 
                                        onClick={createGame}
                                        disabled={isLoading || !valuesInput.trim()}
                                    >
                                        {isLoading ? 'Starting...' : 'Start Game'}
                                    </Button>
                                </div>
                            )}

                            {currentGame && currentGame.state === 'playing' && (
                                <div>
                                    <Row>
                                        <Col md={6}>
                                            <h4>Game in Progress</h4>
                                            <p>
                                                <Badge bg="secondary">
                                                    {currentGame.drawn_values.length} / {currentGame.values.length} values drawn
                                                </Badge>
                                                {currentGame.hardcore_mode && (
                                                    <Badge bg="warning" className="ms-2">
                                                        Hardcore Mode
                                                    </Badge>
                                                )}
                                            </p>
                                            
                                            {getLastDrawnValue() && (
                                                <Alert variant="success">
                                                    <h5>Last Drawn: <strong>{getLastDrawnValue()}</strong></h5>
                                                </Alert>
                                            )}

                                            <div className="d-grid gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    size="lg"
                                                    onClick={drawValue}
                                                    disabled={isLoading || currentGame.drawn_values.length >= currentGame.values.length}
                                                >
                                                    {isLoading ? 'Drawing...' : 'Draw Next Value'}
                                                </Button>
                                                
                                                <Button 
                                                    variant="danger" 
                                                    onClick={endGame}
                                                    disabled={isLoading}
                                                >
                                                    End Game
                                                </Button>
                                            </div>
                                        </Col>
                                        
                                        <Col md={6}>
                                            <h5>Previously Drawn:</h5>
                                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {currentGame.drawn_values.map((value: string, index: number) => (
                                                    <Badge 
                                                        key={index}
                                                        className="me-2 mb-2"
                                                    >
                                                        {value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {currentGame && currentGame.state === 'ended' && (
                                <div>
                                    <Alert variant="success" className="text-center">
                                        <h2>BINGO!</h2>
                                        {currentGame.winner_public_name && (
                                            <div className="mt-3">
                                                <div className="d-flex align-items-center justify-content-center mb-3">
                                                    {currentGame.winner_avatar_url && (
                                                        <img 
                                                            src={currentGame.winner_avatar_url} 
                                                            alt={`${currentGame.winner_public_name}'s avatar`}
                                                            className="rounded-circle me-3"
                                                            style={{ width: '64px', height: '64px' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="mb-0">{currentGame.winner_public_name}</h3>
                                                        <p className="text-muted mb-0">Winner!</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <p className="mt-3 mb-0">Game ended. Create a new game above to play again!</p>
                                    </Alert>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BingoHost;
