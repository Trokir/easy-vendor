import { PrivacyLegislation } from '../../services/geoLocation.service';
import { PrivacyContextType } from '../../contexts/PrivacyContext';

/**
 * Базовый мок для настроек приватности
 */
export const mockPrivacySettings = {
  doNotSell: false,
  email: 'test@example.com',
  lastUpdated: new Date('2023-01-01').toISOString(),
  dataDeleteRequested: false,
  marketingConsent: true,
  region: 'US-CA',
  consentVersion: '1.0',
};

/**
 * Создает мок для контекста приватности с возможностью переопределения значений
 */
export function createPrivacyContextMock(overrides?: Partial<PrivacyContextType>): PrivacyContextType {
  return {
    settings: mockPrivacySettings,
    isLoading: false,
    error: null,
    updateSettings: jest.fn().mockResolvedValue({}),
    setCCPAOptOut: jest.fn().mockResolvedValue({}),
    applicableLegislation: PrivacyLegislation.CCPA,
    isCaliforniaUser: true,
    ...overrides
  };
}

/**
 * Готовый мок контекста с настройками по умолчанию
 */
export const mockPrivacyContext = createPrivacyContextMock();

/**
 * Мок для калифорнийского пользователя
 */
export const mockCaliforniaContext = createPrivacyContextMock({
  isCaliforniaUser: true,
  applicableLegislation: PrivacyLegislation.CCPA,
});

/**
 * Мок для пользователя из Вирджинии
 */
export const mockVirginiaContext = createPrivacyContextMock({
  isCaliforniaUser: false,
  applicableLegislation: PrivacyLegislation.CDPA,
});

/**
 * Мок для пользователя с отключенной продажей данных
 */
export const mockOptedOutContext = createPrivacyContextMock({
  settings: {
    ...mockPrivacySettings,
    doNotSell: true,
  }
});

/**
 * Мок для ошибки в контексте
 */
export const mockErrorContext = createPrivacyContextMock({
  error: new Error('Privacy settings could not be loaded'),
}); 