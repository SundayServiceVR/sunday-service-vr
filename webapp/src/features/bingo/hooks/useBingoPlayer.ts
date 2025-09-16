import { useState, useEffect, useContext, useCallback } from 'react';
import { FirebaseAuthContext } from '../../../contexts/FirebaseAuthContext';
import { db } from '../../../util/firebase';
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
import { BingoGame, BingoCard } from '../../../util/types';

export const useBingoPlayer = () => {
    const { user } = useContext(FirebaseAuthContext);
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

    const generatePlayerCard = useCallback(async () => {
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

    return {
        // State
        currentGame,
        playerCard,
        isLoading,
        error,
        
        // Actions
        setError,
        toggleCell,
        claimBingo,
        
        // Computed values
        getCellClass,
        checkForBingo,
        getIndex,
    };
};
