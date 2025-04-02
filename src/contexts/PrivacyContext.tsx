import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrivacySettings } from '../types/privacy';
import { GeoLocationService, PrivacyLegislation } from '../services/geoLocation.service';
import { PrivacySettingsService } from '../services/privacySettings.service';

interface PrivacyContextType {
  settings: PrivacySettings | null;
  isCaliforniaUser: boolean;
  userState: string;
  applicableLegislation: PrivacyLegislation;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: Partial<PrivacySettings>) => Promise<void>;
  setCCPAOptOut: (value: boolean) => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isCaliforniaUser, setIsCaliforniaUser] = useState<boolean>(false);
  const [userState, setUserState] = useState<string>('');
  const [applicableLegislation, setApplicableLegislation] = useState<PrivacyLegislation>(PrivacyLegislation.NONE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPrivacyData = async () => {
      try {
        setIsLoading(true);
        const [settingsData, isCalifornia, state, legislation] = await Promise.all([
          PrivacySettingsService.getSettings(),
          GeoLocationService.isCaliforniaUser(),
          GeoLocationService.getUserState(),
          GeoLocationService.getApplicableLegislation(),
        ]);

        setSettings(settingsData);
        setIsCaliforniaUser(isCalifornia);
        setUserState(state);
        setApplicableLegislation(legislation);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load privacy settings'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPrivacyData();
  }, []);

  const updateSettings = async (newSettings: Partial<PrivacySettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = await PrivacySettingsService.updateSettings(newSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update privacy settings'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setCCPAOptOut = async (value: boolean) => {
    try {
      setIsLoading(true);
      const response = await PrivacySettingsService.setCCPAOptOut(value);
      if (response.success) {
        await updateSettings({ doNotSell: value });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update CCPA opt-out status'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrivacyContext.Provider
      value={{
        settings,
        isCaliforniaUser,
        userState,
        applicableLegislation,
        isLoading,
        error,
        updateSettings,
        setCCPAOptOut,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}; 