import { renderHook, act } from '@testing-library/react-hooks';
import { usePrivacySettings } from './usePrivacySettings';
import { PrivacySettingsService } from '../services/privacySettings.service';
import { GeoLocationService } from '../services/geoLocation.service';

// Mock the PrivacySettingsService and GeoLocationService
jest.mock('../services/privacySettings.service');
jest.mock('../services/geoLocation.service');

describe('usePrivacySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(false);
    const { result } = renderHook(() => usePrivacySettings());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.settings).toBeNull();
  });

  it('should load settings successfully', async () => {
    const mockSettings = {
      doNotSell: false,
      email: 'test@example.com',
      lastUpdated: new Date().toISOString(),
    };

    (PrivacySettingsService.getSettings as jest.Mock).mockResolvedValueOnce(mockSettings);
    (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => usePrivacySettings());

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.settings).toEqual(mockSettings);
    expect(result.current.isCaliforniaUser).toBe(true);
  });

  it('should handle loading error', async () => {
    const error = { message: 'Failed to load settings' };
    (PrivacySettingsService.getSettings as jest.Mock).mockRejectedValueOnce(error);
    (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => usePrivacySettings());

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.settings).toBeNull();
  });

  it('should update settings successfully', async () => {
    const mockSettings = {
      doNotSell: false,
      email: 'test@example.com',
      lastUpdated: new Date().toISOString(),
    };

    (PrivacySettingsService.getSettings as jest.Mock).mockResolvedValueOnce(mockSettings);
    (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(false);
    (PrivacySettingsService.updateSettings as jest.Mock).mockResolvedValueOnce({
      ...mockSettings,
      doNotSell: true,
    });

    const { result } = renderHook(() => usePrivacySettings());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Update settings
    await act(async () => {
      await result.current.updateSettings({ doNotSell: true });
    });

    expect(result.current.settings?.doNotSell).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle update error', async () => {
    const mockSettings = {
      doNotSell: false,
      email: 'test@example.com',
      lastUpdated: new Date().toISOString(),
    };

    (PrivacySettingsService.getSettings as jest.Mock).mockResolvedValueOnce(mockSettings);
    (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(false);
    
    // Use a string error message instead of Error constructor
    (PrivacySettingsService.updateSettings as jest.Mock).mockRejectedValueOnce({ 
      message: 'Failed to update settings' 
    });

    const { result } = renderHook(() => usePrivacySettings());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Attempt to update settings
    await act(async () => {
      try {
        await result.current.updateSettings({ doNotSell: true });
      } catch (err) {
        // Expected error
      }
    });

    expect(result.current.settings).toEqual(mockSettings);
    expect(result.current.error).not.toBeNull();
  });
}); 