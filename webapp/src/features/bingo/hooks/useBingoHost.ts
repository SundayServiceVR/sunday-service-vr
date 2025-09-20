import { useState, useEffect, useContext } from 'react';
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
import { BingoGame, BingoGameState } from '../../../util/types';

export const useBingoHost = () => {
    const { user } = useContext(FirebaseAuthContext);
    const [currentGame, setCurrentGame] = useState<BingoGame | null>(null);
    const [valuesInput, setValuesInput] = useState('');
    const [hardcoreMode, setHardcoreMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

            // Get the most recent active game or most recent ended game if no active games
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
                state: 'playing' as BingoGameState,
                host_discord_id: user.uid,
                values,
                drawn_values: [],
                hardcore_mode: hardcoreMode,
                created_at: new Date(),
                started_at: new Date(),
            };

            await addDoc(collection(db, 'bingo_games'), {
                ...gameData,
                created_at: serverTimestamp(),
                started_at: serverTimestamp(),
            });

            setValuesInput('');
            setHardcoreMode(false);
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
            (value: string) => !currentGame.drawn_values.includes(value)
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

    const getLastDrawnValue = () => {
        if (!currentGame || currentGame.drawn_values.length === 0) return null;
        return currentGame.drawn_values[currentGame.drawn_values.length - 1];
    };

    return {
        // State
        currentGame,
        valuesInput,
        hardcoreMode,
        isLoading,
        error,
        
        // Actions
        setValuesInput,
        setHardcoreMode,
        setError,
        createGame,
        startGame,
        drawValue,
        endGame,
        
        // Computed values
        getLastDrawnValue,
    };
};
