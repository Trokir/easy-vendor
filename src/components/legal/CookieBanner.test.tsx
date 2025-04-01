import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CookieBanner } from './CookieBanner';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('CookieBanner', () => {
  const defaultProps = {
    open: true,
    onAccept: jest.fn(),
    onDecline: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    renderWithTheme(<CookieBanner {...defaultProps} />);
    expect(screen.getByText(/We use cookies/)).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithTheme(<CookieBanner {...defaultProps} open={false} />);
    expect(screen.queryByText(/We use cookies/)).not.toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    renderWithTheme(<CookieBanner {...defaultProps} />);
    fireEvent.click(screen.getByText('Accept'));
    expect(defaultProps.onAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when decline button is clicked', () => {
    renderWithTheme(<CookieBanner {...defaultProps} />);
    fireEvent.click(screen.getByText('Decline'));
    expect(defaultProps.onDecline).toHaveBeenCalledTimes(1);
  });

  it('opens policy link in new tab when learn more is clicked', () => {
    const policyLink = '/custom-policy';
    const windowSpy = jest.spyOn(window, 'open');
    renderWithTheme(<CookieBanner {...defaultProps} policyLink={policyLink} />);
    fireEvent.click(screen.getByText('Learn more'));
    expect(windowSpy).toHaveBeenCalledWith(policyLink, '_blank');
  });

  it('uses custom text props', () => {
    const customProps = {
      ...defaultProps,
      message: 'Custom message',
      acceptButtonText: 'Custom accept',
      declineButtonText: 'Custom decline',
      learnMoreButtonText: 'Custom learn more',
    };
    renderWithTheme(<CookieBanner {...customProps} />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
    expect(screen.getByText('Custom accept')).toBeInTheDocument();
    expect(screen.getByText('Custom decline')).toBeInTheDocument();
    expect(screen.getByText('Custom learn more')).toBeInTheDocument();
  });
}); 