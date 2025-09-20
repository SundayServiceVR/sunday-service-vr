import React, { useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Nav, Modal } from 'react-bootstrap';
import { FirebaseAuthContext } from '../../contexts/FirebaseAuthContext';
import { Link } from 'react-router-dom';
import { useBingoPlayer } from './hooks';
import './BingoPlayer.css';

const BingoPlayer: React.FC = () => {
    const { roles } = useContext(FirebaseAuthContext);
    const {
        currentGame,
        playerCard,
        isLoading,
        error,
        showNopeModal,
        setShowNopeModal,
        toggleCell,
        claimBingo,
        checkForBingo,
        getCellClass,
        getIndex,
    } = useBingoPlayer();

    if (!currentGame) {
        return (
            <Container className="py-4">
                <Row className="justify-content-center">
                    <Col lg={6}>
                        <Alert variant="info" className="text-center">
                            <h4>No Active Bingo Game</h4>
                            <p>There is no bingo game currently running. Please wait for a host to start a game.</p>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (currentGame.state === 'setup') {
        return (
            <Container className="py-4">
                <Row className="justify-content-center">
                    <Col lg={6}>
                        <Alert variant="warning" className="text-center">
                            <h4>Waiting to Start</h4>
                            <p>A bingo game is being set up. Please wait for the host to start the game.</p>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (currentGame.state === 'ended') {
        return (
            <Container className="py-4">
                <Row className="justify-content-center">
                    <Col lg={6}>
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
                            <p>The game has ended. Wait for the host to start a new game.</p>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Navigation for authorized users */}
            {(roles?.includes('host') || roles?.includes('admin')) && (
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link as={Link} to="/bingo" className="active">
                            Player View
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={Link} to="/bingo/host">
                            Host Console
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            )}
            
            <Row className="justify-content-center">
                <Col lg={8}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {playerCard?.locked_out && (
                        <Alert variant="danger">
                            <strong>Locked Out!</strong> You claimed a false bingo and can no longer participate in this game.
                            {currentGame?.hardcore_mode && <div className="mt-2"><em>This game is running in Hardcore Mode.</em></div>}
                        </Alert>
                    )}

                    <Card>
                        <Card.Header className="text-center">
                            <h3>BINGO</h3>
                            <Badge bg="info">
                                {currentGame.drawn_values.length} values called
                            </Badge>
                            {currentGame.hardcore_mode && (
                                <Badge bg="warning" className="ms-2">
                                    Hardcore Mode
                                </Badge>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {!playerCard ? (
                                <div className="text-center">
                                    <p>Generating your bingo card...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bingo-grid mx-auto" style={{ maxWidth: '400px' }}>
                                        <div className="bingo-header">
                                            <div>B</div>
                                            <div>I</div>
                                            <div>N</div>
                                            <div>G</div>
                                            <div>O</div>
                                        </div>
                                        {Array.from({ length: 5 }, (_, rowIndex) => (
                                            <div key={rowIndex} className="bingo-row">
                                                {Array.from({ length: 5 }, (_, colIndex) => {
                                                    const index = getIndex(rowIndex, colIndex);
                                                    const cell = playerCard.grid[index];
                                                    return (
                                                        <div
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={getCellClass(rowIndex, colIndex)}
                                                            onClick={() => toggleCell(rowIndex, colIndex)}
                                                            style={{
                                                                cursor: (rowIndex === 2 && colIndex === 2) || playerCard.locked_out ? 'default' : 'pointer'
                                                            }}
                                                        >
                                                            {cell}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center mt-4">
                                        <Button
                                            variant="success"
                                            size="lg"
                                            className="w-100"
                                            onClick={claimBingo}
                                            disabled={isLoading || playerCard.locked_out || !checkForBingo(playerCard.marked)}
                                        >
                                            {isLoading ? 'Checking...' : 'BINGO!'}
                                        </Button>
                                    </div>

                                    {/* <div className="mt-3">
                                        <small className="text-muted">
                                            Click on the squares to mark them when the number is called. 
                                            The center square is FREE. Green squares have been called.
                                        </small>
                                    </div> */}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Nope Modal */}
            <Modal show={showNopeModal} onHide={() => setShowNopeModal(false)} centered>
                <Modal.Body className="text-center py-5">
                    <h1 style={{ fontSize: '4rem', margin: '0' }}>🙅‍♂️</h1>
                    <h2 className="mt-3 mb-0">Nope</h2>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-0">
                    <Button variant="secondary" onClick={() => setShowNopeModal(false)}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BingoPlayer;
