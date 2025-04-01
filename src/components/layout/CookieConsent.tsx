import React, { useEffect, useState } from 'react';
import { CookieBanner } from '../legal/CookieBanner';
import { useConsent } from '../../hooks/useConsent';

const COOKIE_CONSENT_KEY = 'cookie_consent';

interface CookieConsentProps {
  onError?: (error: string) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onError }) => {
  const [showBanner, setShowBanner] = useState(false);
  const { recordConsent } = useConsent({
    userId: 'anonymous',
    consentType: 'cookies',
    version: '1.0',
    onError,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setShowBanner(!consent);
  }, []);

  const handleAccept = async () => {
    try {
      await recordConsent({ timestamp: Date.now() });
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      setShowBanner(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to record cookie consent');
    }
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  return (
    <CookieBanner
      open={showBanner}
      onAccept={handleAccept}
      onDecline={handleDecline}
      message="We use cookies to enhance your browsing experience and analyze site traffic."
      policyLink="/legal/cookies"
      acceptButtonText="Accept all cookies"
      declineButtonText="Decline"
      learnMoreButtonText="Learn more about cookies"
    />
  );
}; 