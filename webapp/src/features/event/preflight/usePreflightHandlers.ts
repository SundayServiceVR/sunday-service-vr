import { useState } from 'react';
import toast from 'react-hot-toast';
import { Event } from '../../../util/types';
import { clearWhiteboard, updateWhiteboard } from '../../../util/whiteboard';

export const usePreflightHandlers = (
    eventScratchpad: Event,
    proposeEventChange: (event: Event) => void,
    saveEvent: (newEvent: Event, oldEvent: Event) => Promise<void>
) => {
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
    const [showPosterModal, setShowPosterModal] = useState(false);
    const [updatingBoard, setUpdatingBoard] = useState(false);
    const [showBoardPreview, setShowBoardPreview] = useState(false);

    const handleClearBoard = async () => {
        if (!window.confirm('Reset the whiteboard to the placeholder text and default posters?')) {
            return;
        }

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

    const handleSaveMessage = async (updatedMessage: string) => {
        try {
            const newEvent = { ...eventScratchpad, message: updatedMessage };
            await saveEvent(newEvent, eventScratchpad);
            proposeEventChange(newEvent);
            toast.success('Message updated successfully!');
        } catch (error) {
            toast.error(`Error saving message: ${(error as Error).message}`);
        }
    };

    const handleSaveSocialMediaMessage = async (updatedMessage: string) => {
        try {
            const newEvent = { ...eventScratchpad, socialMediaMessage: updatedMessage };
            await saveEvent(newEvent, eventScratchpad);
            proposeEventChange(newEvent);
            toast.success('Social media message updated successfully!');
        } catch (error) {
            toast.error(`Error saving social media message: ${(error as Error).message}`);
        }
    };

    return {
        showMessageModal,
        setShowMessageModal,
        showSocialMediaModal,
        setShowSocialMediaModal,
        showPosterModal,
        setShowPosterModal,
        updatingBoard,
        handleUpdateBoard,
        handleClearBoard,
        showBoardPreview,
        setShowBoardPreview,
        handleSaveMessage,
        handleSaveSocialMediaMessage,
    };
};
