import { useState, useEffect } from 'react';
import { LegalConsentService } from '../services/legal-consent/legal-consent.service';
import { ConsentType, ConsentMetadata } from '../types/legal-consent';

interface UseConsentOptions {
  userId: string;
  consentType: ConsentType;
  version: string;
  onError?: (error: string) => void;
}

interface UseConsentResult {
  isAccepted: boolean;
  isLoading: boolean;
  error: string | null;
  recordConsent: (metadata?: ConsentMetadata) => Promise<boolean>;
  checkConsent: () => Promise<void>;
}

const legalConsentService = new LegalConsentService();

export const useConsent = (options: UseConsentOptions): UseConsentResult => {
  const { userId, consentType, version, onError } = options;
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const checkConsent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { accepted } = await legalConsentService.checkConsent(
        userId,
        consentType,
        version
      );
      setIsAccepted(accepted);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const recordConsent = async (metadata?: ConsentMetadata): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await legalConsentService.recordConsent(
        userId,
        consentType,
        version,
        metadata
      );
      setIsAccepted(true);
      return result.success;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConsent();
  }, [userId, consentType, version]);

  return {
    isAccepted,
    isLoading,
    error,
    recordConsent,
    checkConsent,
  };
}; 