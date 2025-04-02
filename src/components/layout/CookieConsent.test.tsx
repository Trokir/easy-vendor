import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieConsent } from './CookieConsent';
import { LegalConsentContext, ConsentType } from '../../contexts/LegalConsentContext';
import { renderWithProviders, waitForComponentToPaint } from '../../mocks/test-utils';

// Мок для локального хранилища
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

// Переопределяем localStorage для тестов
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CookieConsent', () => {
  // Сбрасываем моки перед каждым тестом
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // Значения по умолчанию для контекста
  const defaultContextValue = {
    consents: {},
    history: [],
    loading: false,
    error: null,
    checkConsent: jest.fn().mockResolvedValue(false),
    recordConsent: jest.fn().mockResolvedValue({}),
    loadConsentHistory: jest.fn().mockResolvedValue([]),
    clearError: jest.fn(),
  };

  const renderWithContext = (ui: React.ReactElement, contextValue = defaultContextValue) => {
    return renderWithProviders(
      <LegalConsentContext.Provider value={contextValue}>
        {ui}
      </LegalConsentContext.Provider>
    );
  };

  it('shows cookie banner when consent is not stored', async () => {
    renderWithContext(<CookieConsent />);
    
    await waitForComponentToPaint();
    expect(screen.getByText(/We use cookies to enhance your browsing experience/i)).toBeInTheDocument();
    expect(screen.getByText('Accept all cookies')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });

  it('hides cookie banner when consent is already stored', async () => {
    // Устанавливаем согласие в localStorage перед рендерингом
    localStorageMock.getItem.mockReturnValue('accepted');
    
    renderWithContext(<CookieConsent />);
    
    // Используем waitFor, чтобы подождать, пока компонент проверит localStorage и обновит состояние
    await waitFor(() => {
      expect(screen.queryByText(/We use cookies to enhance your browsing experience/i)).not.toBeInTheDocument();
    });
  });

  it('records consent and hides banner on accept', async () => {
    const recordConsentMock = jest.fn().mockResolvedValue({});
    const contextValue = {
      ...defaultContextValue,
      recordConsent: recordConsentMock,
    };
    
    renderWithContext(<CookieConsent />, contextValue);
    await waitForComponentToPaint();
    
    // Нажимаем кнопку Accept
    const acceptButton = screen.getByText('Accept all cookies');
    userEvent.click(acceptButton);
    
    // Проверяем, что функция recordConsent была вызвана с правильными параметрами
    await waitFor(() => {
      expect(recordConsentMock).toHaveBeenCalledWith(ConsentType.COOKIE_POLICY, '1.0');
    });
    
    // Проверяем, что consent был сохранен в localStorage
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie_consent', 'accepted');
    });
    
    // Проверяем, что баннер исчез
    await waitFor(() => {
      expect(screen.queryByText(/We use cookies to enhance your browsing experience/i)).not.toBeInTheDocument();
    });
  });

  it('does not record consent but hides banner on decline', async () => {
    renderWithContext(<CookieConsent />);
    await waitForComponentToPaint();
    
    // Нажимаем кнопку Decline
    const declineButton = screen.getByText('Decline');
    userEvent.click(declineButton);
    
    // Проверяем, что функция recordConsent не была вызвана
    expect(defaultContextValue.recordConsent).not.toHaveBeenCalled();
    
    // Проверяем, что consent был сохранен в localStorage как declined
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie_consent', 'declined');
    });
    
    // Проверяем, что баннер исчез
    await waitFor(() => {
      expect(screen.queryByText(/We use cookies to enhance your browsing experience/i)).not.toBeInTheDocument();
    });
  });

  it('calls onError when error occurs', async () => {
    const errorMessage = 'Failed to record consent';
    const recordConsentMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    const onError = jest.fn();
    
    const contextValue = {
      ...defaultContextValue,
      recordConsent: recordConsentMock,
    };
    
    renderWithContext(<CookieConsent onError={onError} />, contextValue);
    await waitForComponentToPaint();
    
    // Нажимаем кнопку Accept
    const acceptButton = screen.getByText('Accept all cookies');
    userEvent.click(acceptButton);
    
    // Ждем обработки ошибки
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    
    // Проверяем, что баннер все равно исчезает
    await waitFor(() => {
      expect(screen.queryByText(/We use cookies to enhance your browsing experience/i)).not.toBeInTheDocument();
    });
  });
});
