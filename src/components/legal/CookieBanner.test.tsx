import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders, waitForComponentToPaint, fireEvent } from '../../mocks/test-utils';
import { CookieBanner } from './CookieBanner';

describe('CookieBanner', () => {
  const defaultProps = {
    open: true,
    onAccept: jest.fn(),
    onDecline: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Вспомогательная функция для рендеринга
  const renderComponent = (props = {}) => {
    return renderWithProviders(<CookieBanner {...defaultProps} {...props} />);
  };

  it('renders correctly when open', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    expect(screen.getByText(/We use cookies to enhance your browsing experience/)).toBeInTheDocument();
    expect(screen.getByText('Accept all cookies')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    renderComponent({ open: false });
    await waitForComponentToPaint();
    
    expect(screen.queryByText(/We use cookies/)).not.toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    fireEvent.click(screen.getByText('Accept all cookies'));
    await waitForComponentToPaint();
    
    expect(defaultProps.onAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when decline button is clicked', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    fireEvent.click(screen.getByText('Decline'));
    await waitForComponentToPaint();
    
    expect(defaultProps.onDecline).toHaveBeenCalledTimes(1);
  });

  it('opens policy link in new tab when learn more is clicked', async () => {
    const policyLink = '/custom-policy';
    renderComponent({ policyLink });
    await waitForComponentToPaint();
    
    const learnMoreLink = screen.getByText('Learn more');
    expect(learnMoreLink).toHaveAttribute('href', policyLink);
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
    expect(learnMoreLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses custom text props', async () => {
    const customProps = {
      message: 'Custom message',
      acceptButtonText: 'Custom accept',
      declineButtonText: 'Custom decline',
      learnMoreButtonText: 'Custom learn more',
    };
    renderComponent(customProps);
    await waitForComponentToPaint();
    
    expect(screen.getByText('Custom message')).toBeInTheDocument();
    expect(screen.getByText('Custom accept')).toBeInTheDocument();
    expect(screen.getByText('Custom decline')).toBeInTheDocument();
    expect(screen.getByText('Custom learn more')).toBeInTheDocument();
  });

  it('renders with default policy link when not provided', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });
    expect(learnMoreLink).toHaveAttribute('href', '/cookies');
  });

  it('renders with correct button variants', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    const declineButton = screen.getByRole('button', { name: 'Decline' });
    const acceptButton = screen.getByRole('button', { name: 'Accept all cookies' });
    expect(declineButton).toHaveClass('MuiButton-outlined');
    expect(acceptButton).toHaveClass('MuiButton-contained');
  });

  it('renders with correct button sizes', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('MuiButton-sizeSmall');
    });
  });

  it('renders with correct link attributes', async () => {
    renderComponent();
    await waitForComponentToPaint();
    
    const link = screen.getByRole('link', { name: 'Learn more' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
