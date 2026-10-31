import { render, screen } from '@testing-library/react'
import EventCreate from '../EventCreate'
import { MemoryRouter } from 'react-router-dom'
import { EventDjDataProvider } from '../../../../contexts/useEventDjCache/eventDjDataProvider'

const renderWithRouter = () => {
    return render(
        <MemoryRouter>
            <EventDjDataProvider>
                <EventCreate />
            </EventDjDataProvider>
        </MemoryRouter>
    )
}

describe('EventCreate', () => {
    it('has a Create button', async () => {
        renderWithRouter()
        expect(
            await screen.findByText(/Create/, { selector: 'button' })
        ).toBeInTheDocument()
    })

    it('has an event name field and a single host field', async () => {
        renderWithRouter()
        expect(await screen.findByTestId('event-name')).toBeInTheDocument()
        expect(await screen.findByTestId('event-host')).toBeInTheDocument()
    })
})
