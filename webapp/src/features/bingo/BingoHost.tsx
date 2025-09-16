import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Nav } from 'react-bootstrap';
import { FirebaseAuthContext } from '../../contexts/FirebaseAuthContext';
import { db } from '../../util/firebase';
import { 
    collection, 
    doc, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { BingoGame, BingoGameState } from '../../util/types';
import { Link } from 'react-router-dom';

const BingoHost: React.FC = () => {
    const { user } = useContext(FirebaseAuthContext);
    const [currentGame, setCurrentGame] = useState<BingoGame | null>(null);
    const [valuesInput, setValuesInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        // Listen for active games
        const gamesRef = collection(db, 'bingo_games');
        const q = query(gamesRef, where('state', 'in', ['setup', 'playing']));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const games = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate(),
                started_at: doc.data().started_at?.toDate(),
                ended_at: doc.data().ended_at?.toDate(),
            })) as BingoGame[];

            // Get the most recent active game
            if (games.length > 0) {
                setCurrentGame(games[0]);
            } else {
                setCurrentGame(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const createGame = async () => {
        if (!user || !valuesInput.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const values = valuesInput
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0);

            if (values.length < 25) {
                setError('Please provide at least 25 values for the bingo game.');
                setIsLoading(false);
                return;
            }

            const gameData: Omit<BingoGame, 'id'> = {
                state: 'setup' as BingoGameState,
                host_discord_id: user.uid,
                values,
                drawn_values: [],
                created_at: new Date(),
            };

            await addDoc(collection(db, 'bingo_games'), {
                ...gameData,
                created_at: serverTimestamp(),
            });

            setValuesInput('');
        } catch (err) {
            setError('Failed to create game. Please try again.');
            console.error('Error creating game:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const startGame = async () => {
        if (!currentGame || currentGame.state !== 'setup') return;

        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'bingo_games', currentGame.id!), {
                state: 'playing',
                started_at: serverTimestamp(),
            });
        } catch (err) {
            setError('Failed to start game. Please try again.');
            console.error('Error starting game:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const drawValue = async () => {
        if (!currentGame || currentGame.state !== 'playing') return;

        const availableValues = currentGame.values.filter(
            value => !currentGame.drawn_values.includes(value)
        );

        if (availableValues.length === 0) {
            setError('No more values to draw!');
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableValues.length);
        const drawnValue = availableValues[randomIndex];

        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'bingo_games', currentGame.id!), {
                drawn_values: [...currentGame.drawn_values, drawnValue],
            });
        } catch (err) {
            setError('Failed to draw value. Please try again.');
            console.error('Error drawing value:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const endGame = async () => {
        if (!currentGame) return;

        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'bingo_games', currentGame.id!), {
                state: 'ended',
                ended_at: serverTimestamp(),
            });
        } catch (err) {
            setError('Failed to end game. Please try again.');
            console.error('Error ending game:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForNewGame = () => {
        setCurrentGame(null);
        setValuesInput('');
        setError(null);
    };

    const getLastDrawnValue = () => {
        if (!currentGame || currentGame.drawn_values.length === 0) return null;
        return currentGame.drawn_values[currentGame.drawn_values.length - 1];
    };

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

                            {!currentGame && (
                                <div>
                                    <h4>Create New Bingo Game</h4>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Bingo Values (comma-separated, minimum 25)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            value={valuesInput}
                                            onChange={(e) => setValuesInput(e.target.value)}
                                            placeholder="B1, B2, B3, I16, I17, N31, N32, G46, G47, O61, O62, ..."
                                            disabled={isLoading}
                                        />
                                        <Form.Text className="text-muted">
                                            Enter at least 25 values separated by commas. These will be randomly distributed to player cards.
                                        </Form.Text>
                                    </Form.Group>
                                    <Button 
                                        variant="primary" 
                                        onClick={createGame}
                                        disabled={isLoading || !valuesInput.trim()}
                                    >
                                        {isLoading ? 'Creating...' : 'Create Game'}
                                    </Button>
                                </div>
                            )}

                            {currentGame && currentGame.state === 'setup' && (
                                <div>
                                    <h4>Game Setup Complete</h4>
                                    <Alert variant="info">
                                        Game created with {currentGame.values.length} values. 
                                        Players can now see "Waiting to start" on their screens.
                                    </Alert>
                                    <Button 
                                        variant="success" 
                                        size="lg"
                                        onClick={startGame}
                                        disabled={isLoading}
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
                                                {currentGame.drawn_values.map((value, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        bg="outline-secondary" 
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
                                    <Alert variant="success">
                                        <h4>Game Ended!</h4>
                                        {currentGame.winner_public_name && (
                                            <p>Winner: <strong>{currentGame.winner_public_name}</strong></p>
                                        )}
                                    </Alert>
                                    <Button 
                                        variant="primary" 
                                        onClick={resetForNewGame}
                                    >
                                        Start New Game
                                    </Button>
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
