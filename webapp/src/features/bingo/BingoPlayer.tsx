import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Nav } from 'react-bootstrap';
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
import { BingoGame, BingoCard } from '../../util/types';
import { Link } from 'react-router-dom';
import './BingoPlayer.css';

const BingoPlayer: React.FC = () => {
    const { user, roles } = useContext(FirebaseAuthContext);
    const [currentGame, setCurrentGame] = useState<BingoGame | null>(null);
    const [playerCard, setPlayerCard] = useState<BingoCard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper functions for converting between 2D and 1D array indices
    const getIndex = (row: number, col: number) => row * 5 + col;

    useEffect(() => {
        if (!user) return;

        // Listen for active games
        const gamesRef = collection(db, 'bingo_games');
        const q = query(gamesRef, where('state', 'in', ['setup', 'playing', 'ended']));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const games = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate(),
                started_at: doc.data().started_at?.toDate(),
                ended_at: doc.data().ended_at?.toDate(),
            })) as BingoGame[];

            // Sort by creation time (newest first) and prioritize active games
            games.sort((a, b) => {
                // First, prioritize setup and playing games over ended games
                if (a.state !== 'ended' && b.state === 'ended') return -1;
                if (a.state === 'ended' && b.state !== 'ended') return 1;
                
                // Then sort by creation time (newest first)
                return b.created_at.getTime() - a.created_at.getTime();
            });

            if (games.length > 0) {
                setCurrentGame(games[0]);
            } else {
                setCurrentGame(null);
                setPlayerCard(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const generatePlayerCard = React.useCallback(async () => {
        if (!user || !currentGame || currentGame.state !== 'playing') return;

        setIsLoading(true);
        try {
            // Shuffle and pick 24 random values (25th is FREE space)
            const shuffled = [...currentGame.values].sort(() => Math.random() - 0.5);
            const cardValues = shuffled.slice(0, 24);

            // Create flattened arrays for 5x5 grid with FREE space in center (index 12)
            const grid: string[] = [];
            const marked: boolean[] = [];
            
            let valueIndex = 0;
            for (let i = 0; i < 25; i++) {
                if (i === 12) { // Center position (row 2, col 2)
                    grid[i] = 'FREE';
                    marked[i] = true;
                } else {
                    grid[i] = cardValues[valueIndex];
                    marked[i] = false;
                    valueIndex++;
                }
            }

            const cardData: Omit<BingoCard, 'id'> = {
                game_id: currentGame.id!,
                player_discord_id: user.uid,
                player_public_name: user.displayName || 'Unknown Player',
                grid,
                marked,
                has_bingo: false,
                bingo_claimed: false,
                locked_out: false,
                created_at: new Date(),
            };

            await addDoc(collection(db, 'bingo_cards'), {
                ...cardData,
                created_at: serverTimestamp(),
            });
        } catch (err) {
            setError('Failed to generate bingo card. Please try again.');
            console.error('Error generating card:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, currentGame]);

    useEffect(() => {
        if (!user || !currentGame) return;

        // Listen for player's card
        const cardsRef = collection(db, 'bingo_cards');
        const q = query(
            cardsRef, 
            where('game_id', '==', currentGame.id),
            where('player_discord_id', '==', user.uid)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const cardDoc = snapshot.docs[0];
                const card = {
                    id: cardDoc.id,
                    ...cardDoc.data(),
                    created_at: cardDoc.data().created_at?.toDate(),
                } as BingoCard;
                setPlayerCard(card);
            } else if (currentGame.state === 'playing') {
                // Generate card if game is playing and player doesn't have one
                generatePlayerCard();
            }
        });

        return () => unsubscribe();
    }, [user, currentGame, generatePlayerCard]);

    const toggleCell = async (row: number, col: number) => {
        if (!playerCard || !currentGame || currentGame.state !== 'playing' || playerCard.locked_out) return;
        
        // Can't toggle FREE space (center position)
        if (row === 2 && col === 2) return;

        const index = getIndex(row, col);
        const newMarked = [...playerCard.marked];
        newMarked[index] = !newMarked[index];

        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'bingo_cards', playerCard.id!), {
                marked: newMarked,
            });
        } catch (err) {
            setError('Failed to update card. Please try again.');
            console.error('Error updating card:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const checkForBingo = (marked: boolean[]): boolean => {
        // Check rows
        for (let row = 0; row < 5; row++) {
            let rowWin = true;
            for (let col = 0; col < 5; col++) {
                if (!marked[getIndex(row, col)]) {
                    rowWin = false;
                    break;
                }
            }
            if (rowWin) return true;
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
            let colWin = true;
            for (let row = 0; row < 5; row++) {
                if (!marked[getIndex(row, col)]) {
                    colWin = false;
                    break;
                }
            }
            if (colWin) return true;
        }

        // Check diagonals
        // Top-left to bottom-right
        if (marked[getIndex(0, 0)] && marked[getIndex(1, 1)] && marked[getIndex(2, 2)] && 
            marked[getIndex(3, 3)] && marked[getIndex(4, 4)]) return true;
        
        // Top-right to bottom-left
        if (marked[getIndex(0, 4)] && marked[getIndex(1, 3)] && marked[getIndex(2, 2)] && 
            marked[getIndex(3, 1)] && marked[getIndex(4, 0)]) return true;

        return false;
    };

    const claimBingo = async () => {
        if (!playerCard || !currentGame || !user || currentGame.state !== 'playing' || playerCard.locked_out) return;

        const hasBingo = checkForBingo(playerCard.marked);
        if (!hasBingo) {
            setError('You do not have a valid bingo!');
            return;
        }

        // Validate that all marked cells (except FREE) have been called
        const invalidMarks = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const index = getIndex(row, col);
                if (playerCard.marked[index] && !(row === 2 && col === 2)) {
                    const cellValue = playerCard.grid[index];
                    if (!currentGame.drawn_values.includes(cellValue)) {
                        invalidMarks.push(cellValue);
                    }
                }
            }
        }

        setIsLoading(true);
        try {
            if (invalidMarks.length > 0) {
                // Lock out player for false bingo
                await updateDoc(doc(db, 'bingo_cards', playerCard.id!), {
                    locked_out: true,
                });
                setError(`Invalid bingo! You marked values that weren't called: ${invalidMarks.join(', ')}`);
            } else {
                // Valid bingo! End the game
                await updateDoc(doc(db, 'bingo_games', currentGame.id!), {
                    state: 'ended',
                    winner_discord_id: user.uid,
                    winner_public_name: user.displayName || 'Unknown Player',
                    winner_avatar_url: user.photoURL || '',
                    ended_at: serverTimestamp(),
                });

                await updateDoc(doc(db, 'bingo_cards', playerCard.id!), {
                    has_bingo: true,
                    bingo_claimed: true,
                });
            }
        } catch (err) {
            setError('Failed to claim bingo. Please try again.');
            console.error('Error claiming bingo:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getCellClass = (row: number, col: number): string => {
        if (!playerCard) return 'bingo-cell';
        
        const index = getIndex(row, col);
        const isMarked = playerCard.marked[index];
        const isFree = row === 2 && col === 2;

        let classes = 'bingo-cell';
        if (isMarked) classes += ' marked';
        if (isFree) classes += ' free';

        return classes;
    };

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
                            <h2>🎉 BINGO! 🎉</h2>
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
                        </Alert>
                    )}

                    <Card>
                        <Card.Header className="text-center">
                            <h3>BINGO</h3>
                            <Badge bg="info">
                                {currentGame.drawn_values.length} values called
                            </Badge>
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
                                            onClick={claimBingo}
                                            disabled={isLoading || playerCard.locked_out || !checkForBingo(playerCard.marked)}
                                        >
                                            {isLoading ? 'Checking...' : 'BINGO!'}
                                        </Button>
                                    </div>

                                    <div className="mt-3">
                                        <small className="text-muted">
                                            Click on the squares to mark them when the number is called. 
                                            The center square is FREE. Green squares have been called.
                                        </small>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BingoPlayer;
