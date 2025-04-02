import React, { useEffect, useState } from 'react';
import { CookieBanner } from '../legal/CookieBanner';
import { useLegalConsent, ConsentType } from '../../contexts/LegalConsentContext';

const COOKIE_CONSENT_KEY = 'cookie_consent';

interface CookieConsentProps {
  onError?: (error: string) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onError }) => {
  const [showBanner, setShowBanner] = useState(false);
  const { recordConsent, error } = useLegalConsent();
  
  // Handle errors from the consent context
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setShowBanner(!consent);
  }, []);

  const handleAccept = async () => {
    try {
      // Используем userId = 0 для анонимных пользователей (не аутентифицированных)
      await recordConsent(ConsentType.COOKIE_POLICY, '1.0');
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      setShowBanner(false);
    } catch (error) {
      console.error('Error in handleAccept:', error);
      // Если произошла ошибка из-за отсутствия аутентификации, все равно сохраняем согласие локально
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      setShowBanner(false);
      // Сообщаем об ошибке, если есть обработчик
      if (error instanceof Error) {
        onError?.(error.message);
      } else {
        onError?.('Failed to record cookie consent');
      }
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
