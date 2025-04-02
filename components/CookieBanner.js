import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieBanner = ({ message = 'We use cookies for authentication and analytics.' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
    // TODO: Send consent to backend
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm">
            {message}{' '}
            <Link href="/legal/cookies" className="underline">
              Learn more
            </Link>
          </p>
        </div>
        <button
          onClick={acceptCookies}
          className="ml-4 px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
