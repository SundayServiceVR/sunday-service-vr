import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('true?', () => {
  expect(true).toBe(true);
});

test('App renders text (smoke test)', async () => {
    render(<App />)
    const elementsWithText = await screen.findAllByText(/\w+/)
    expect(elementsWithText).toBeTruthy()
})
