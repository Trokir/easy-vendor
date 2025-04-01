import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CookieConsent } from './CookieConsent';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('CookieConsent', () => {
  const COOKIE_CONSENT_KEY = 'cookie_consent';

  beforeEach(() => {
    localStorage.clear();
  });

  it('shows banner when no consent is stored', () => {
    renderWithTheme(<CookieConsent />);
    expect(screen.getByText(/We use cookies/)).toBeInTheDocument();
  });

  it('does not show banner when consent is stored', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    renderWithTheme(<CookieConsent />);
    expect(screen.queryByText(/We use cookies/)).not.toBeInTheDocument();
  });

  it('stores accepted consent in localStorage', async () => {
    renderWithTheme(<CookieConsent />);
    fireEvent.click(screen.getByText('Accept all cookies'));
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted');
  });

  it('stores declined consent in localStorage', () => {
    renderWithTheme(<CookieConsent />);
    fireEvent.click(screen.getByText('Decline'));
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('declined');
  });

  it('hides banner after accepting', async () => {
    renderWithTheme(<CookieConsent />);
    fireEvent.click(screen.getByText('Accept all cookies'));
    expect(screen.queryByText(/We use cookies/)).not.toBeInTheDocument();
  });

  it('hides banner after declining', () => {
    renderWithTheme(<CookieConsent />);
    fireEvent.click(screen.getByText('Decline'));
    expect(screen.queryByText(/We use cookies/)).not.toBeInTheDocument();
  });

  it('calls onError when error occurs', async () => {
    const onError = jest.fn();
    renderWithTheme(<CookieConsent onError={onError} />);
    // Simulate error by mocking fetch
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    fireEvent.click(screen.getByText('Accept all cookies'));
    expect(onError).toHaveBeenCalled();
  });
}); 