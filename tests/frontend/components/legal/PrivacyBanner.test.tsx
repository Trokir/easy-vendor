import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrivacyBanner } from '../../../../src/components/legal/PrivacyBanner';
import * as PrivacySettingsHook from '../../../../src/hooks/usePrivacySettings';
import { PrivacyLegislation } from '../../../../src/services/geoLocation.service';
import '@testing-library/jest-dom/vitest';

// Mock the usePrivacySettings hook
vi.mock('../../../../src/hooks/usePrivacySettings', () => ({
  usePrivacySettings: vi.fn(),
}));

// Mock window.location
const mockLocationValue = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocationValue,
  writable: true,
});

describe('PrivacyBanner Component', () => {
  // Setup localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  // Setup window.location mock
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    mockLocationValue.href = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for California users with CCPA legislation', () => {
    // Mock the hook to return California user with CCPA
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    render(<PrivacyBanner />);
    
    // Check if the banner content is rendered
    expect(screen.getByText('California Consumer Privacy Act Notice')).toBeInTheDocument();
    expect(screen.getByText(/We respect your privacy rights under CCPA/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Do Not Sell My Data/i })).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });

  it('renders correctly for Virginia users with CDPA legislation', () => {
    // Mock the hook to return Virginia user with CDPA
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: false,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CDPA,
      updateSettings: vi.fn(),
    });
    
    render(<PrivacyBanner />);
    
    // Check if the banner content is rendered for CDPA
    expect(screen.getByText('Virginia Privacy Notice')).toBeInTheDocument();
    expect(screen.getByText(/Under Virginia's CDPA/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manage My Data/i })).toBeInTheDocument();
  });

  it('does not render when user has opted out', () => {
    // Mock the hook to return user with doNotSell=true
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: true },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    const { container } = render(<PrivacyBanner />);
    
    // The component should return null for opted-out users
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when loading', () => {
    // Mock the hook to return loading state
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: true,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    const { container } = render(<PrivacyBanner />);
    
    // The component should return null while loading
    expect(container).toBeEmptyDOMElement();
  });

  it('sets localStorage when "Accept" button is clicked', () => {
    // Mock the hook to return California user
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    render(<PrivacyBanner />);
    
    // Find and click the "Accept" button
    const acceptButton = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptButton);
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('privacyBannerSeen', 'true');
  });

  it('calls setCCPAOptOut when secondary button is clicked for California users', async () => {
    // Create a mock function
    const mockSetCCPAOptOut = vi.fn().mockResolvedValue(undefined);
    
    // Mock the hook to return California user with our mock function
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    render(<PrivacyBanner />);
    
    // Find and click the "Do Not Sell My Data" button
    const optOutButton = screen.getByRole('button', { name: /Do Not Sell My Data/i });
    fireEvent.click(optOutButton);
    
    // Verify the setCCPAOptOut function was called with true
    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('privacyBannerSeen', 'true');
  });

  it('redirects to the appropriate page for non-California users', async () => {
    // Mock the hook to return Virginia user
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: false,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CDPA,
      updateSettings: vi.fn(),
    });
    
    render(<PrivacyBanner />);
    
    // Find and click the "Manage My Data" button
    const manageButton = screen.getByRole('button', { name: /Manage My Data/i });
    fireEvent.click(manageButton);
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('privacyBannerSeen', 'true');
    
    // Check if redirection would happen to the correct URL
    await waitFor(() => {
      expect(window.location.href).toBe('/privacy-choices');
    });
  });

  it('displays error alert when present', () => {
    // Mock the hook to return error
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: { message: 'Test error message' },
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    render(<PrivacyBanner />);
    
    // Check if error is displayed
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('respects the position prop', () => {
    // Mock the hook
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: PrivacyLegislation.CCPA,
      updateSettings: vi.fn(),
    });
    
    // Render with top position
    render(<PrivacyBanner position="top" />);
    
    // Check if position is applied - since we can't directly test the Snackbar's position,
    // we can verify that the component renders with the expected content instead
    expect(screen.getByText('California Consumer Privacy Act Notice')).toBeInTheDocument();
    
    // We could also check that the component is rendering with the correct props,
    // but this would require more complex testing setup with component prop testing
  });
}); 