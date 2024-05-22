import { render, screen } from '@testing-library/react'
import EventCreate from '../EventCreate'
import { MemoryRouter } from 'react-router-dom'

const renderWithRouter = () => {
    return render(
        <MemoryRouter>
            <EventCreate />
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

    it('has more than one text field', async () => {
        renderWithRouter()
        expect((await screen.findAllByRole('textbox')).length).toBeGreaterThan(1)
    })
})
