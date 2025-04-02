import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PrivacySettings } from '../types/privacy';
import { GeoLocationService, PrivacyLegislation } from '../services/geoLocation.service';
import { PrivacySettingsService } from '../services/privacySettings.service';

// Типы для контекста приватности
export interface PrivacyContextType {
  settings: PrivacySettings;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: Partial<PrivacySettings>) => Promise<void>;
  setCCPAOptOut: (optOut: boolean) => Promise<void>;
  applicableLegislation: PrivacyLegislation | string;
  isCaliforniaUser: boolean;
}

// Значения по умолчанию
const defaultContext: PrivacyContextType = {
  settings: {
    doNotSell: false,
    email: '',
    lastUpdated: new Date().toISOString()
  },
  isLoading: true,
  error: null,
  updateSettings: async () => {},
  setCCPAOptOut: async () => {},
  applicableLegislation: PrivacyLegislation.NONE,
  isCaliforniaUser: false,
};

// Создаем контекст
export const PrivacyContext = createContext<PrivacyContextType>(defaultContext);

// Hook для использования контекста
export const usePrivacyContext = () => useContext(PrivacyContext);

// Провайдер контекста
interface PrivacyProviderProps {
  children: ReactNode;
}

export const PrivacyProvider = ({ children }: PrivacyProviderProps) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    doNotSell: false,
    email: '',
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [applicableLegislation, setApplicableLegislation] = useState<PrivacyLegislation | string>(
    PrivacyLegislation.NONE
  );
  const [isCaliforniaUser, setIsCaliforniaUser] = useState<boolean>(false);

  // Загрузка настроек приватности при первом рендере
  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        setIsLoading(true);
        // Здесь будет запрос к API за настройками пользователя
        
        // Имитация запроса для примера
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Загрузка данных о местоположении пользователя
        // и определение применимого законодательства
        // (можно использовать геолокацию или IP)
        const userLocation = localStorage.getItem('userRegion') || '';
        
        if (userLocation === 'CA') {
          setIsCaliforniaUser(true);
          setApplicableLegislation(PrivacyLegislation.CCPA);
        } else if (userLocation === 'VA') {
          setApplicableLegislation(PrivacyLegislation.CDPA);
        } else {
          setApplicableLegislation(PrivacyLegislation.NONE);
        }
        
        // Загрузка сохраненных настроек из localStorage (для демо)
        const savedSettings = localStorage.getItem('privacySettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPrivacySettings();
  }, []);

  // Обновление настроек приватности
  const updateSettings = async (newSettings: Partial<PrivacySettings>) => {
    try {
      setIsLoading(true);
      // В реальности здесь был бы API-запрос на обновление настроек
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Сохранение в localStorage для демо
      localStorage.setItem('privacySettings', JSON.stringify(updatedSettings));
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Удобная функция для установки опции Do Not Sell (CCPA)
  const setCCPAOptOut = async (optOut: boolean) => {
    try {
      await updateSettings({ doNotSell: optOut });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update CCPA opt-out status'));
      throw err;
    }
  };

  const contextValue: PrivacyContextType = {
    settings,
    isLoading,
    error,
    updateSettings,
    setCCPAOptOut,
    applicableLegislation,
    isCaliforniaUser,
  };

  return (
    <PrivacyContext.Provider value={contextValue}>
      {children}
    </PrivacyContext.Provider>
  );
}; 