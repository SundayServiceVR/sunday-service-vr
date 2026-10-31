import { Event } from '../../../util/types';

export const getMissingRequirements = (event: Event) => {
    const missing: ('Name' | 'Host' | 'Date' | 'Lineup')[] = [];
    if (!event.name?.trim()) missing.push('Name');
    if (!event.host?.trim()) missing.push('Host');
    if (!event.start_datetime || isNaN(event.start_datetime.getTime())) missing.push('Date');
    if (!event.slots || event.slots.length === 0) missing.push('Lineup');
    return missing;
};
