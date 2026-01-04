import { useState } from 'react';
import toast from 'react-hot-toast';
import { Event } from '../../../util/types';

export const usePreflightHandlers = (
    eventScratchpad: Event,
    proposeEventChange: (event: Event) => void,
    saveEvent: (newEvent: Event, oldEvent: Event) => Promise<void>
) => {
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
    const [showPosterModal, setShowPosterModal] = useState(false);

    const handlePublish = async () => {
        try {
            const newEvent = { ...eventScratchpad, published: true };
            await saveEvent(newEvent, eventScratchpad);
            proposeEventChange(newEvent);
            toast.success('Event published successfully!');
        } catch (error) {
            toast.error(`Error publishing event: ${(error as Error).message}`);
        }
    };

    const handleUnpublish = async () => {
        try {
            const newEvent = { ...eventScratchpad, published: false };
            await saveEvent(newEvent, eventScratchpad);
            proposeEventChange(newEvent);
            toast.success('Event unpublished successfully!');
        } catch (error) {
            toast.error(`Error unpublishing event: ${(error as Error).message}`);
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
        handlePublish,
        handleUnpublish,
        handleSaveMessage,
        handleSaveSocialMediaMessage,
    };
};
