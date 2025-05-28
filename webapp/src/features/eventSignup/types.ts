import { SlotType, SlotDuration } from '../../util/types';

// Define the form data interface for all steps
export interface EventSignupFormData {
    event_id: string;
    dj_name?: string;
    requested_duration?: SlotDuration;
    type?: SlotType;

    is_b2b?: string;
    b2b_members_response?: string;
    availableFrom?: string;
    availableTo?: string;
    streamLink?: string;
    confirmExpectations?: boolean;
    otherInfo?: string;

}
