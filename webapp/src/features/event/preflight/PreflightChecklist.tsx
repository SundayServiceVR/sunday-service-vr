import { Container, Card } from 'react-bootstrap';
import { useEventOperations } from '../outletContext';
import { useEventStore } from '../../../hooks/useEventStore/useEventStore';
import { EventStatusCard } from './EventStatusCard';
import { getMissingRequirements } from './getMissingRequirements';
import { PreflightChecklistStep } from './PreflightChecklistStep';
import { OutdatedStepsAccordion } from './OutdatedStepsAccordion';
import { usePreflightHandlers } from './usePreflightHandlers';
import { useChecklistItems } from './useChecklistItems';
import { LineupPosterModal } from './LineupPosterModal';
import { WhiteboardPreviewModal } from './WhiteboardPreviewModal';

const PreflightChecklist = () => {
    const [eventScratchpad, proposeEventChange, onLineupPosterFileSelected] = useEventOperations();
    const { saveEvent } = useEventStore();
    
    const handlers = usePreflightHandlers(eventScratchpad, saveEvent);
    const checklistItems = useChecklistItems(eventScratchpad);

    const hasMinimumRequirements = () => getMissingRequirements(eventScratchpad).length === 0;

    const requiredItems = checklistItems.filter(item => !item.optional);
    const optionalItems = checklistItems.filter(item => item.optional);
    const completedCount = requiredItems.filter(item => item.completed).length;
    const totalCount = requiredItems.length;

    return (
        <Container>
            <h1 className="display-6 mb-4">Preflight Checklist</h1>
            
            <EventStatusCard
                event={eventScratchpad}
                onEventChange={proposeEventChange}
                completedCount={completedCount}
                totalCount={totalCount}
                hasMinimumRequirements={hasMinimumRequirements()}
                onUpdateBoard={handlers.handleUpdateBoard}
                onClearBoard={handlers.handleClearBoard}
                onViewBoard={() => handlers.setShowBoardPreview(true)}
                updatingBoard={handlers.updatingBoard}
            />

            <WhiteboardPreviewModal
                show={handlers.showBoardPreview}
                onHide={() => handlers.setShowBoardPreview(false)}
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
                                eventScratchpad={eventScratchpad}
                                onUploadPoster={() => handlers.setShowPosterModal(true)}
                            />
                        ))}
                        {optionalItems.map((item, index) => (
                            <PreflightChecklistStep
                                key={`opt-${index}`}
                                item={item}
                                eventScratchpad={eventScratchpad}
                                onUploadPoster={() => handlers.setShowPosterModal(true)}
                            />
                        ))}
                    </div>
                </Card.Body>
            </Card>

            <OutdatedStepsAccordion />
            
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