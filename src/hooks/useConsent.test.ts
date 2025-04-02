import { renderHook, act } from '@testing-library/react';
import { useConsent } from './useConsent';
import { ConsentType } from '../types/consent.types';

describe('useConsent', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useConsent({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
      })
    );

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('checks consent status on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accepted: true }),
    });

    const { result } = renderHook(() =>
      useConsent({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
      })
    );

    await act(async () => {
      await result.current.checkConsent();
    });

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('records consent successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() =>
      useConsent({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
      })
    );

    await act(async () => {
      const success = await result.current.recordConsent({ timestamp: Date.now() });
      expect(success).toBe(true);
    });

    expect(result.current.isAccepted).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles errors during consent check', async () => {
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useConsent({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
        onError,
      })
    );

    await act(async () => {
      await result.current.checkConsent();
    });

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(onError).toHaveBeenCalledWith(errorMessage);
  });

  it('handles errors during consent recording', async () => {
    const errorMessage = 'Server error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useConsent({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
        onError,
      })
    );

    await act(async () => {
      const success = await result.current.recordConsent({ timestamp: Date.now() });
      expect(success).toBe(false);
    });

    expect(result.current.isAccepted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(onError).toHaveBeenCalledWith(errorMessage);
  });

  it('handles loading state correctly', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { result } = renderHook(() =>
      useConsent({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
      })
    );

    act(() => {
      result.current.checkConsent();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.isLoading).toBe(false);
  });
});
