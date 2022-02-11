import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render without electron', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
