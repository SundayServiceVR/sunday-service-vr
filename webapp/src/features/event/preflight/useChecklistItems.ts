import { useMemo } from 'react';
import { ChecklistItem } from './types';
import { Event } from '../../../util/types';

export const useChecklistItems = (eventScratchpad: Event) => {
    return useMemo((): ChecklistItem[] => [
        {
            label: 'Host Assigned',
            completed: !!eventScratchpad.host,
            description: 'Event has a host assigned',
            link: `/events/${eventScratchpad.id}/setup`,
            optional: false,
            action: { type: 'internal', label: 'Complete' },
        },
        {
            label: 'Lineup Created',
            completed: eventScratchpad.slots.length > 0,
            description: `${eventScratchpad.slots.length} slot(s) in lineup`,
            link: `/events/${eventScratchpad.id}/lineup`,
            optional: false,
            action: { type: 'internal', label: 'Complete' },
        },
        {
            label: 'Lineup Poster',
            completed: !!eventScratchpad.lineup_poster_url,
            description: eventScratchpad.lineup_poster_url 
                ? 'Lineup poster uploaded and ready'
                : 'Upload a lineup poster image',
            link: '',
            optional: true,
            action: { type: 'poster' },
        },
        {
            label: 'Discord Announcement',
            completed: false,
            description: eventScratchpad.message && eventScratchpad.message.trim() !== '' 
                ? 'Message customized and ready'
                : 'Customize your Discord announcement message',
            link: 'https://discord.com/channels/1004489038159413248/1004489042890588165',
            optional: true,
            action: { type: 'messaging', platform: 'discord' },
        },
        {
            label: 'VRChat Announcement',
            completed: false,
            description: 'Post this event to VRChat group.',
            link: 'https://vrchat.com/home/group/grp_626cd923-6dea-4583-abcb-8c09a765969f/posts',
            optional: true,
            action: { type: 'messaging', platform: 'vrchat' },
        },
    ], [eventScratchpad.host, eventScratchpad.id, eventScratchpad.slots.length, eventScratchpad.message, eventScratchpad.lineup_poster_url]);
};
