import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DoNotSellPage } from '../../../../src/components/legal/DoNotSellPage';
import * as PrivacySettingsHook from '../../../../src/hooks/usePrivacySettings';

// Mock the usePrivacySettings hook
vi.mock('../../../../src/hooks/usePrivacySettings', () => ({
  usePrivacySettings: vi.fn(),
}));

describe('DoNotSellPage Component', () => {
  beforeEach(() => {
    // Default mock implementation
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn().mockResolvedValue(undefined),
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and content correctly', () => {
    render(<DoNotSellPage />);
    
    // Check for page title
    expect(screen.getByText('Do Not Sell My Personal Information')).toBeInTheDocument();
    
    // Check for sections - using getByRole to be more specific
    expect(screen.getByRole('heading', { name: 'What data we collect' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How we use your data' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Opt-out of selling data' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Additional information' })).toBeInTheDocument();
    
    // Check for contact information
    expect(screen.getByText(/privacy@easyvendor.com/)).toBeInTheDocument();
    expect(screen.getByText(/\(555\) 123-4567/)).toBeInTheDocument();
  });

  it('shows loading indicator when data is loading', () => {
    // Mock loading state
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: true,
      error: null,
      settings: null,
      setCCPAOptOut: vi.fn(),
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<DoNotSellPage />);
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Page content should not be visible during loading
    expect(screen.queryByText('Do Not Sell My Personal Information')).not.toBeInTheDocument();
  });

  it('submits the form with valid email', async () => {
    const mockSetCCPAOptOut = vi.fn().mockResolvedValue(undefined);
    
    // Set up the mock
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<DoNotSellPage />);
    
    // Get the email input
    const emailInput = screen.getByLabelText(/Email/i);
    
    // Type valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Opt-out of selling data/i });
    fireEvent.click(submitButton);
    
    // Check that setCCPAOptOut was called
    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText(/Your request to opt-out of selling data has been processed successfully/i)).toBeInTheDocument();
    });
  });

  it('shows already opted out message when user has already opted out', () => {
    // Mock already opted out
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: true },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<DoNotSellPage />);
    
    // Button should be disabled and show "already opted out" text
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Opt-out already completed');
  });

  it('shows error alert if opt-out request fails', async () => {
    const mockError = new Error('Request failed');
    const mockSetCCPAOptOut = vi.fn().mockRejectedValue(mockError);
    
    // Set up the mock
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<DoNotSellPage />);
    
    // Get the email input and enter valid email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Opt-out of selling data/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/An error occurred while processing your request/i)).toBeInTheDocument();
    });
  });
}); 