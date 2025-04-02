import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithMui } from '../utils/mui-test-utils';
import { PrivacyBanner } from '../../components/legal/PrivacyBanner';
import { PrivacyContext } from '../../contexts/PrivacyContext';
import { mockServer } from '../mocks/msw-handlers';
import { 
  mockCaliforniaContext, 
  mockVirginiaContext, 
  mockOptedOutContext, 
  mockErrorContext,
  createPrivacyContextMock 
} from '../mocks/privacy-context.mock';
import { PrivacyLegislation } from '../../services/geoLocation.service';

// Мокируем локальное хранилище
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
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PrivacyBanner - Интеграционные тесты', () => {
  // Запуск мок-сервера перед всеми тестами
  beforeAll(() => {
    mockServer.listen();
  });

  // Сброс моков и хранилища после каждого теста
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  // Сброс обработчиков после каждого теста
  afterEach(() => {
    mockServer.resetHandlers();
  });

  // Завершение работы сервера после всех тестов
  afterAll(() => {
    mockServer.close();
  });

  it('отображает баннер для пользователя из Калифорнии', () => {
    renderWithMui(
      <PrivacyContext.Provider value={mockCaliforniaContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.getByText('California Consumer Privacy Act Notice')).toBeInTheDocument();
    expect(screen.getByText('Do Not Sell My Data')).toBeInTheDocument();
  });

  it('отображает баннер для пользователя из Вирджинии', () => {
    renderWithMui(
      <PrivacyContext.Provider value={mockVirginiaContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.getByText('Virginia Privacy Notice')).toBeInTheDocument();
    expect(screen.getByText('Manage My Data')).toBeInTheDocument();
  });

  it('отображает общий баннер для пользователей из других регионов', () => {
    // Создаем мок для пользователя из другого региона
    const genericContext = createPrivacyContextMock({
      isCaliforniaUser: false,
      applicableLegislation: PrivacyLegislation.NONE,
    });

    renderWithMui(
      <PrivacyContext.Provider value={genericContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.getByText('Privacy Notice')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('не отображает баннер, если пользователь уже отказался от продажи данных', () => {
    renderWithMui(
      <PrivacyContext.Provider value={mockOptedOutContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.queryByText('California Consumer Privacy Act Notice')).not.toBeInTheDocument();
    expect(screen.queryByText('Virginia Privacy Notice')).not.toBeInTheDocument();
    expect(screen.queryByText('Privacy Notice')).not.toBeInTheDocument();
  });

  it('не отображает баннер, если он уже был показан', () => {
    // Устанавливаем, что баннер уже был показан
    localStorageMock.setItem('privacyBannerSeen', 'true');

    renderWithMui(
      <PrivacyContext.Provider value={mockCaliforniaContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.queryByText('California Consumer Privacy Act Notice')).not.toBeInTheDocument();
  });

  it('сохраняет информацию о просмотре баннера при нажатии на Accept', () => {
    renderWithMui(
      <PrivacyContext.Provider value={mockCaliforniaContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    // Нажимаем на кнопку Accept
    fireEvent.click(screen.getByText('Accept'));

    // Проверяем, что информация была сохранена в localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('privacyBannerSeen', 'true');
  });

  it('вызывает setCCPAOptOut для калифорнийского пользователя при нажатии на Do Not Sell', async () => {
    const contextMock = createPrivacyContextMock();
    const mockSetCCPAOptOut = contextMock.setCCPAOptOut as jest.Mock;

    renderWithMui(
      <PrivacyContext.Provider value={contextMock}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    // Нажимаем на кнопку Do Not Sell My Data
    fireEvent.click(screen.getByText('Do Not Sell My Data'));

    // Проверяем, что была вызвана функция
    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });

    // Проверяем, что информация была сохранена в localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('privacyBannerSeen', 'true');
  });

  it('отображает ошибку, если есть проблема с загрузкой настроек', () => {
    renderWithMui(
      <PrivacyContext.Provider value={mockErrorContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.getByText('Privacy settings could not be loaded')).toBeInTheDocument();
  });

  it('не отображает баннер во время загрузки', () => {
    // Создаем мок с состоянием загрузки
    const loadingContext = createPrivacyContextMock({
      isLoading: true,
    });

    renderWithMui(
      <PrivacyContext.Provider value={loadingContext}>
        <PrivacyBanner />
      </PrivacyContext.Provider>
    );

    expect(screen.queryByText('Privacy Notice')).not.toBeInTheDocument();
    expect(screen.queryByText('California Consumer Privacy Act Notice')).not.toBeInTheDocument();
  });
}); 