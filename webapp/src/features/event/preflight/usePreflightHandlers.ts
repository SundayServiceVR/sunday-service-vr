import { useState } from 'react';
import toast from 'react-hot-toast';
import { Event } from '../../../util/types';
import { confirm } from '../../../components/confirm';
import { clearWhiteboard, updateWhiteboard } from '../../../util/whiteboard';

export const usePreflightHandlers = (
    eventScratchpad: Event,
    saveEvent: (newEvent: Event, oldEvent: Event) => Promise<void>
) => {
    const [showPosterModal, setShowPosterModal] = useState(false);
    const [updatingBoard, setUpdatingBoard] = useState(false);
    const [showBoardPreview, setShowBoardPreview] = useState(false);

    const clearBoard = async () => {
        setUpdatingBoard(true);
        try {
            const result = await clearWhiteboard();
            toast.success(result.status === 'dry-run'
                ? 'Emulator: board clear skipped (nothing was pushed).'
                : result.status === 'unchanged' ? 'Board is already cleared.' : 'Board cleared!');
        } catch (error) {
            toast.error(`Error clearing board: ${(error as Error).message}`);
        } finally {
            setUpdatingBoard(false);
        }
    };

    const handleClearBoard = () => {
        confirm({
            title: 'Are you sure?',
            message: 'Reset the whiteboard to the placeholder text and default posters?',
            confirmButton: { text: 'Yes', action: clearBoard },
            cancelButton: { text: 'Cancel' },
        });
    };

    const handleUpdateBoard = async () => {
        if (!eventScratchpad.id) {
            toast.error('Save the event before updating the board.');
            return;
        }

        setUpdatingBoard(true);
        try {
            // The board is built from the saved event, so persist the current state first.
            await saveEvent(eventScratchpad, eventScratchpad);
            const result = await updateWhiteboard(eventScratchpad.id);

            if (result.status === 'dry-run') {
                toast.success('Emulator: board update skipped (nothing was pushed).');
            } else if (result.status === 'unchanged') {
                toast.success('Board is already up to date.');
            } else {
                toast.success('Board updated!');
            }
            if (result.posterFallback) {
                toast.error('A poster could not be loaded, so the default poster was used.');
            }
        } catch (error) {
            toast.error(`Error updating board: ${(error as Error).message}`);
        } finally {
            setUpdatingBoard(false);
        }
    };

    return {
        showPosterModal,
        setShowPosterModal,
        updatingBoard,
        handleUpdateBoard,
        handleClearBoard,
        showBoardPreview,
        setShowBoardPreview,
    };
};
