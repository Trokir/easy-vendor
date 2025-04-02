import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrivacyChoicesPage } from '../../../../src/components/legal/PrivacyChoicesPage';
import * as PrivacySettingsHook from '../../../../src/hooks/usePrivacySettings';
import { PrivacyLegislation } from '../../../../src/services/geoLocation.service';

// Mock the usePrivacySettings hook
vi.mock('../../../../src/hooks/usePrivacySettings', () => ({
  usePrivacySettings: vi.fn(),
}));

describe('PrivacyChoicesPage Component', () => {
  // Setup default mock implementation
  beforeEach(() => {
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn().mockResolvedValue(undefined),
      updateSettings: vi.fn().mockResolvedValue(undefined),
      applicableLegislation: PrivacyLegislation.CCPA,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Basic test for component rendering
  it('renders correctly for CCPA legislation', () => {
    render(<PrivacyChoicesPage />);
    
    // Check page title
    expect(screen.getByRole('heading', { name: 'California Consumer Privacy Act (CCPA)' })).toBeInTheDocument();
    
    // Check user rights section
    expect(screen.getByRole('heading', { name: 'Your Rights' })).toBeInTheDocument();
    
    // Check form presence
    expect(screen.getByRole('heading', { name: 'Opt-out of selling data' })).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    
    // Using getByRole for radio button instead of getByLabelText
    expect(screen.getByRole('radio', { name: /Opt out of selling my data/i })).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /Submit Request/i })).toBeInTheDocument();
  });

  // Test for loading indicator display
  it('shows loading indicator when data is loading', () => {
    // Mock loading state
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: true,
      error: null,
      settings: null,
      setCCPAOptOut: vi.fn(),
      updateSettings: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
    });
    
    render(<PrivacyChoicesPage />);
    
    // Check loading indicator presence
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Page content should not be displayed
    expect(screen.queryByRole('heading', { name: 'California Consumer Privacy Act (CCPA)' })).not.toBeInTheDocument();
  });

  // Test for form submission to request data sale opt-out
  it('submits opt-out request with CCPA legislation', async () => {
    const mockSetCCPAOptOut = vi.fn().mockResolvedValue(undefined);
    
    // Setup mock with our specific function
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: mockSetCCPAOptOut,
      updateSettings: vi.fn().mockResolvedValue(undefined),
      applicableLegislation: PrivacyLegislation.CCPA,
    });
    
    render(<PrivacyChoicesPage />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Make sure the "Opt out" request type is selected
    const optOutRadio = screen.getByRole('radio', { name: /Opt out of selling my data/i });
    expect(optOutRadio).toBeChecked();
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitButton);
    
    // Check that setCCPAOptOut function was called
    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });
    
    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/Your request has been processed successfully/i)).toBeInTheDocument();
    });
  });

  // Test for invalid email handling
  it('handles invalid email format', async () => {
    render(<PrivacyChoicesPage />);
    
    // Enter invalid email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitButton);
    
    // setCCPAOptOut function should not be called since the form is invalid
    const mockFunctions = vi.mocked(PrivacySettingsHook.usePrivacySettings)();
    await waitFor(() => {
      expect(mockFunctions.setCCPAOptOut).not.toHaveBeenCalled();
    });
  });

  // Test for error display when form submission fails
  it('shows error message when form submission fails', async () => {
    const mockUpdateSettings = vi.fn().mockRejectedValue(new Error('API Error'));
    
    // Setup mock with failing function
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn().mockRejectedValue(new Error('API Error')),
      updateSettings: mockUpdateSettings,
      applicableLegislation: PrivacyLegislation.CCPA,
    });
    
    render(<PrivacyChoicesPage />);
    
    // Fill the form with valid data
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitButton);
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to submit your request/i)).toBeInTheDocument();
    });
  });

  // Test for displaying different legislation (not CCPA)
  it('renders correctly for CDPA legislation', () => {
    // Mock for different legislation
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: false,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      updateSettings: vi.fn(),
      applicableLegislation: PrivacyLegislation.CDPA,
    });
    
    render(<PrivacyChoicesPage />);
    
    // Check page title for CDPA
    expect(screen.getByRole('heading', { name: 'Virginia Consumer Data Protection Act (CDPA)' })).toBeInTheDocument();
    
    // Check that rights include CDPA-specific items
    expect(screen.getByText(/Right to opt out of profiling/i)).toBeInTheDocument();
    
    // Check form title
    expect(screen.getByRole('heading', { name: 'Manage your data rights' })).toBeInTheDocument();
  });
}); 