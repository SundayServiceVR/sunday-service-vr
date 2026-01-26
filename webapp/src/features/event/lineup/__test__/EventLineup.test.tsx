import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import EventLineup from '../EventLineup';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EventDjDataProvider } from '../../../../contexts/useEventDjCache/eventDjDataProvider';
import { Event, SlotDuration, SlotType } from '../../../../util/types';
import { DocumentReference } from 'firebase/firestore';

const mockDjRef1 = { id: 'dj1' } as DocumentReference;
const mockDjRef2 = { id: 'dj2' } as DocumentReference;

const mockSignup1 = {
    dj_refs: [mockDjRef1],
    name: 'Test DJ',
    is_debut: false,
    uuid: 'signup-1',
    requested_duration: 1 as SlotDuration,
    type: SlotType.LIVE,
};

const mockSignup2 = {
    dj_refs: [mockDjRef2],
    name: 'Test DJ 2',
    is_debut: false,
    uuid: 'signup-2',
    requested_duration: 1 as SlotDuration,
    type: SlotType.LIVE,
};

const mockEvent: Event = {
    name: 'Test Event',
    published: false,
    message: 'Test message',
    host: 'Test Host',
    footer: 'Test Footer',
    start_datetime: new Date(),
    dj_plays: [],
    slots: [
        {
            duration: 1 as SlotDuration,
            start_time: new Date(),
            signup_uuid: 'signup-1',
            stream_source_url: 'https://test.com',
            reconciled: {
                signup: mockSignup1,
            },
        },
    ],
    signups: [mockSignup1, mockSignup2],
};

const mockProposeEventChange = vi.fn();

const renderWithRouter = () => {
    return render(
        <MemoryRouter initialEntries={['/event/123/lineup']}>
            <EventDjDataProvider>
                <Routes>
                    <Route
                        path="/event/:id/lineup"
                        element={
                            <div>
                                <EventLineup />
                            </div>
                        }
                    />
                </Routes>
            </EventDjDataProvider>
        </MemoryRouter>
    );
};

// Mock the outlet context hook
vi.mock('../../outletContext', () => ({
    useEventOperations: () => [mockEvent, mockProposeEventChange, vi.fn()],
}));

// Mock the reconciled event hook
vi.mock('../../../../hooks/useEventStore/useReconciledEvent', () => ({
    useReconciledEvent: () => mockEvent,
}));

describe('EventLineup View Modes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders view mode toggle buttons', () => {
        renderWithRouter();
        const buttons = screen.getAllByRole('button');
        const signupsButton = buttons.find(btn => btn.textContent === 'All Signups');
        const buildButton = buttons.find(btn => btn.textContent === 'Build Lineup');
        const lineupButton = buttons.find(btn => btn.textContent === 'Lineup');
        
        expect(signupsButton).toBeInTheDocument();
        expect(buildButton).toBeInTheDocument();
        expect(lineupButton).toBeInTheDocument();
    });

    it('starts in Build Lineup mode by default', () => {
        renderWithRouter();
        const buttons = screen.getAllByRole('button');
        const buildButton = buttons.find(btn => btn.textContent === 'Build Lineup');
        expect(buildButton).toHaveClass('btn-primary');
    });

    it('shows both Signups and Lineup in Build mode', () => {
        renderWithRouter();
        const headings = screen.getAllByRole('heading', { level: 3 });
        const signupsHeading = headings.find(h => h.textContent === 'Signups');
        const lineupHeading = headings.find(h => h.textContent === 'Lineup (Local Times)');
        
        expect(signupsHeading).toBeInTheDocument();
        expect(lineupHeading).toBeInTheDocument();
    });

    it('switches to Signups view when Signups button is clicked', () => {
        renderWithRouter();
        const buttons = screen.getAllByRole('button');
        const signupsButton = buttons.find(btn => btn.textContent === 'All Signups');
        
        if (signupsButton) fireEvent.click(signupsButton);
        
        expect(signupsButton).toHaveClass('btn-primary');
        
        const headings = screen.getAllByRole('heading', { level: 3 });
        const signupsHeading = headings.find(h => h.textContent === 'Signups');
        const lineupHeading = headings.find(h => h.textContent === 'Lineup (Local Times)');
        
        expect(signupsHeading).toBeInTheDocument();
        expect(lineupHeading).toBeUndefined();
    });

    it('switches to Lineup view when Lineup button is clicked', () => {
        renderWithRouter();
        const buttons = screen.getAllByRole('button');
        const lineupButton = buttons.find(btn => btn.textContent === 'Lineup');
        
        if (lineupButton) fireEvent.click(lineupButton);
        
        expect(lineupButton).toHaveClass('btn-primary');
        
        const headings = screen.getAllByRole('heading', { level: 3 });
        const signupsHeading = headings.find(h => h.textContent === 'Signups');
        const lineupHeading = headings.find(h => h.textContent === 'Lineup (Local Times)');
        
        expect(signupsHeading).toBeUndefined();
        expect(lineupHeading).toBeInTheDocument();
    });

    it('shows Add DJ placeholder in Signups and Build modes but not in Lineup mode', () => {
        renderWithRouter();
        
        // Build mode (default) - should show placeholder
        expect(screen.getByText(/\+ Add DJ to Signups/i)).toBeInTheDocument();
        
        // Switch to Lineup mode
        const lineupButton = screen.getByRole('button', { name: /^Lineup$/i });
        fireEvent.click(lineupButton);
        expect(screen.queryByText(/\+ Add DJ to Signups/i)).not.toBeInTheDocument();
        
        // Switch to Signups mode
        const signupsButton = screen.getByRole('button', { name: /^All Signups$/i });
        fireEvent.click(signupsButton);
        expect(screen.getByText(/\+ Add DJ to Signups/i)).toBeInTheDocument();
    });
});
