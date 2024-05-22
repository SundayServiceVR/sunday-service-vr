import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('true?', () => {
  expect(true).toBe(true);
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Sunday Service/i);
  expect(linkElement).toBeInTheDocument();
});
