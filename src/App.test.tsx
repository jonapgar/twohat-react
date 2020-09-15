import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('render twohat demo', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/twohat/i);
  expect(linkElement).toBeInTheDocument();
});
