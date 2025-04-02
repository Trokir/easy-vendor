import React, { ReactNode } from 'react';
import { ServiceProvider } from './ServiceContext';
import { AuthProvider } from './AuthContext';
import { LegalConsentProvider } from './LegalConsentContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Main application provider that combines all context providers
 * This component should wrap the entire application to provide
 * all contexts to all components
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ServiceProvider>
      <AuthProvider>
        <LegalConsentProvider>
          {children}
        </LegalConsentProvider>
      </AuthProvider>
    </ServiceProvider>
  );
};

export default AppProvider; 