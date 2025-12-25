import { Container, Card } from 'react-bootstrap';
import { useEventOperations } from '../outletContext';
import { useEventStore } from '../../../hooks/useEventStore/useEventStore';
import UnifiedMessageEditModal from './messaging/UnifiedMessageEditModal';
import { EventStatusCard } from './EventStatusCard';
import { PreflightChecklistStep } from './PreflightChecklistStep';
import { OutdatedStepsAccordion } from './OutdatedStepsAccordion';
import { usePreflightHandlers } from './usePreflightHandlers';
import { useChecklistItems } from './useChecklistItems';
import { getDiscordMessage, getTwitterMessage } from '../../../util/messageWriters';
import { Event } from '../../../util/types';
import { LineupPosterModal } from './LineupPosterModal';

const PreflightChecklist = () => {
    const [eventScratchpad, proposeEventChange, onLineupPosterFileSelected] = useEventOperations();
    const { saveEvent } = useEventStore();
    
    const handlers = usePreflightHandlers(eventScratchpad, proposeEventChange, saveEvent);
    const checklistItems = useChecklistItems(eventScratchpad);

    const hasMinimumRequirements = () => {
        return eventScratchpad.name != "" && 
               eventScratchpad.host != "" && 
               eventScratchpad.start_datetime && 
               eventScratchpad.slots.length > 0;
    };

    const requiredItems = checklistItems.filter(item => !item.optional);
    const optionalItems = checklistItems.filter(item => item.optional);
    const completedCount = requiredItems.filter(item => item.completed).length;
    const totalCount = requiredItems.length;

    return (
        <Container>
            <h1 className="display-6 mb-4">Preflight Checklist</h1>
            
            <EventStatusCard
                event={eventScratchpad}
                completedCount={completedCount}
                totalCount={totalCount}
                hasMinimumRequirements={hasMinimumRequirements()}
                onPublish={handlers.handlePublish}
                onUnpublish={handlers.handleUnpublish}
            />

            <Card>
                <Card.Header>
                    <h5 className="mb-0">Preflight Checklist</h5>
                </Card.Header>
                <Card.Body>
                    <div className="checklist">
                        {requiredItems.map((item, index) => (
                            <PreflightChecklistStep
                                key={index}
                                item={item}
                                index={index}
                                eventScratchpad={eventScratchpad}
                                onEditMessage={() => handlers.setShowMessageModal(true)}
                                onUploadPoster={() => handlers.setShowPosterModal(true)}
                            />
                        ))}
                        {optionalItems.map((item, index) => (
                            <PreflightChecklistStep
                                key={`opt-${index}`}
                                item={item}
                                index={index}
                                eventScratchpad={eventScratchpad}
                                onEditMessage={
                                    item.action.type === 'messaging' && item.action.platform === 'discord'
                                        ? () => handlers.setShowMessageModal(true)
                                        : () => handlers.setShowSocialMediaModal(true)
                                }
                                onUploadPoster={() => handlers.setShowPosterModal(true)}
                            />
                        ))}
                    </div>
                </Card.Body>
            </Card>

            <OutdatedStepsAccordion
                onShowSocialMediaModal={() => handlers.setShowSocialMediaModal(true)}
            />
            
            <UnifiedMessageEditModal
                show={handlers.showMessageModal}
                onHide={() => handlers.setShowMessageModal(false)}
                event={eventScratchpad}
                onSave={handlers.handleSaveMessage}
                messageType="discord"
                getMessageFromEvent={(event: Event) => event.message}
                generatePreview={(event: Event) => getDiscordMessage(event)}
                title="Edit Discord Announcement Message"
                label="Discord Announcement Message"
                helpText="This message will be included in your Discord announcement."
                previewLabel="Discord Announcement Preview"
                previewHelpText="This is how your Discord announcement will look."
            />
            
            <UnifiedMessageEditModal
                show={handlers.showSocialMediaModal}
                onHide={() => handlers.setShowSocialMediaModal(false)}
                event={eventScratchpad}
                onSave={handlers.handleSaveSocialMediaMessage}
                messageType="social"
                getMessageFromEvent={(event: Event) => event.socialMediaMessage || getTwitterMessage(event)}
                title="Social Media / VRChat Message"
                label="Social Media & VRChat Message"
                helpText="Customize your message for VRChat and social media platforms. The default message is generated from your event details."
            />
            
            <LineupPosterModal
                show={handlers.showPosterModal}
                onHide={() => handlers.setShowPosterModal(false)}
                event={eventScratchpad}
                onFileChange={onLineupPosterFileSelected}
            />
        </Container>
    );
};

export default PreflightChecklist;