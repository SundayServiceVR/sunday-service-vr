import { render, screen } from '@testing-library/react'
import App from './App'

test('App renders', async () => {
    render(<App />)
    expect(await screen.findAllByText(/./)).toBeTruthy()
})
