import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CCPABanner } from '../../../../src/components/legal/CCPABanner';
import * as PrivacySettingsHook from '../../../../src/hooks/usePrivacySettings';

// Mock the usePrivacySettings hook
vi.mock('../../../../src/hooks/usePrivacySettings', () => ({
  usePrivacySettings: vi.fn(),
}));

describe('CCPABanner Component', () => {
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

  // Mock window.localStorage
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for California users', () => {
    // Mock the hook to return California user
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<CCPABanner />);
    
    // Check if the banner content is rendered using a more flexible approach
    expect(screen.getByText(/We respect your privacy rights under CCPA/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Do Not Sell My Data/i })).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });

  it('does not render for non-California users', () => {
    // Mock the hook to return non-California user
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: false,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: 'NONE',
      updateSettings: vi.fn(),
    });
    
    const { container } = render(<CCPABanner />);
    
    // The component should return null for non-California users
    expect(container).toBeEmptyDOMElement();
  });

  it('calls setCCPAOptOut when "Do Not Sell My Data" button is clicked', async () => {
    // Create a mock function
    const mockSetCCPAOptOut = vi.fn().mockResolvedValue(undefined);
    
    // Mock the hook to return California user with our mock function
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<CCPABanner />);
    
    // Find and click the "Do Not Sell My Data" button
    const doNotSellButton = screen.getByRole('button', { name: /Do Not Sell My Data/i });
    fireEvent.click(doNotSellButton);
    
    // Verify the setCCPAOptOut function was called with true
    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ccpaBannerSeen', 'true');
  });

  it('sets localStorage when "Accept" button is clicked', () => {
    // Mock the hook to return California user
    vi.mocked(PrivacySettingsHook.usePrivacySettings).mockReturnValue({
      isCaliforniaUser: true,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
      setCCPAOptOut: vi.fn(),
      applicableLegislation: 'CCPA',
      updateSettings: vi.fn(),
    });
    
    render(<CCPABanner />);
    
    // Find and click the "Accept" button
    const acceptButton = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptButton);
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ccpaBannerSeen', 'true');
  });
}); 