import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CookieBanner } from '../../../../src/components/legal/CookieBanner';
import '@testing-library/jest-dom/vitest';

describe('CookieBanner Component', () => {
  it('renders correctly with default props when open', () => {
    // Create mock functions
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    
    render(
      <CookieBanner
        open={true}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    );
    
    // Check default text content
    expect(screen.getByText(/We use cookies to enhance your browsing experience/i)).toBeInTheDocument();
    
    // Check default buttons
    expect(screen.getByRole('button', { name: /Accept all cookies/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decline/i })).toBeInTheDocument();
    
    // Check default learn more link
    const learnMoreLink = screen.getByText(/Learn more/i);
    expect(learnMoreLink).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn more/i })).toHaveAttribute('href', '/cookies');
  });
  
  it('does not render when open is false', () => {
    // Create mock functions
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    
    const { container } = render(
      <CookieBanner
        open={false}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    );
    
    // Banner should not be visible when open is false
    // Checking for absence of cookie message
    expect(screen.queryByText(/We use cookies to enhance your browsing experience/i)).not.toBeInTheDocument();
  });
  
  it('calls onAccept when Accept button is clicked', () => {
    // Create mock functions
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    
    render(
      <CookieBanner
        open={true}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    );
    
    // Find and click the Accept button
    const acceptButton = screen.getByRole('button', { name: /Accept all cookies/i });
    fireEvent.click(acceptButton);
    
    // Check if onAccept was called once
    expect(onAccept).toHaveBeenCalledTimes(1);
    // Check that onDecline was not called
    expect(onDecline).not.toHaveBeenCalled();
  });
  
  it('calls onDecline when Decline button is clicked', () => {
    // Create mock functions
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    
    render(
      <CookieBanner
        open={true}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    );
    
    // Find and click the Decline button
    const declineButton = screen.getByRole('button', { name: /Decline/i });
    fireEvent.click(declineButton);
    
    // Check if onDecline was called once
    expect(onDecline).toHaveBeenCalledTimes(1);
    // Check that onAccept was not called
    expect(onAccept).not.toHaveBeenCalled();
  });
  
  it('renders with custom message and button text', () => {
    // Create mock functions
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    
    // Custom text for all configurable elements
    const customMessage = 'This site uses cookies for analytics';
    const customAcceptText = 'I agree';
    const customDeclineText = 'No thanks';
    const customLearnMoreText = 'Privacy policy';
    const customPolicyLink = '/privacy';
    
    render(
      <CookieBanner
        open={true}
        onAccept={onAccept}
        onDecline={onDecline}
        message={customMessage}
        acceptButtonText={customAcceptText}
        declineButtonText={customDeclineText}
        learnMoreButtonText={customLearnMoreText}
        policyLink={customPolicyLink}
      />
    );
    
    // Check custom text content
    expect(screen.getByText(/This site uses cookies for analytics/i)).toBeInTheDocument();
    
    // Check custom buttons
    expect(screen.getByRole('button', { name: customAcceptText })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: customDeclineText })).toBeInTheDocument();
    
    // Check custom learn more link
    const customLearnMoreLink = screen.getByText(customLearnMoreText);
    expect(customLearnMoreLink).toBeInTheDocument();
    expect(screen.getByRole('link', { name: customLearnMoreText })).toHaveAttribute('href', customPolicyLink);
  });
}); 