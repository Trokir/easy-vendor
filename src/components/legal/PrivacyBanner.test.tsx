import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PrivacyBanner } from './PrivacyBanner';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';
import { PrivacyLegislation } from '../../services/geoLocation.service';

// Мокаем хук usePrivacySettings
jest.mock('../../hooks/usePrivacySettings');

describe('PrivacyBanner', () => {
  const mockUsePrivacySettings = usePrivacySettings as jest.Mock;
  
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    
    // Настраиваем мок по умолчанию
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: false,
      applicableLegislation: PrivacyLegislation.NONE,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
    });

    // Эмулируем загрузку страницы для обеспечения правильного рендеринга баннера
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly for non-California users', async () => {
    // Специфичная настройка для этого теста
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: false,
      applicableLegislation: PrivacyLegislation.NONE,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
    });

    render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Проверяем заголовок для обычного пользователя
    expect(screen.getByText('Privacy Notice')).toBeInTheDocument();
  });

  it('should render correctly for California users', async () => {
    // Специфичная настройка для пользователя из Калифорнии
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: true,
      applicableLegislation: PrivacyLegislation.CCPA,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
    });

    render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Проверяем заголовок для пользователя из Калифорнии
    expect(screen.getByText('California Consumer Privacy Act Notice')).toBeInTheDocument();
    expect(screen.getByText('Do Not Sell My Data')).toBeInTheDocument();
  });

  it('should render correctly for Virginia users', async () => {
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: false,
      applicableLegislation: PrivacyLegislation.CDPA,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
    });

    render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    expect(screen.getByText('Virginia Privacy Notice')).toBeInTheDocument();
    expect(screen.getByText('Manage My Data')).toBeInTheDocument();
  });

  it('should not render when settings.doNotSell is true', () => {
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: true,
      applicableLegislation: PrivacyLegislation.CCPA,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      settings: { doNotSell: true },
    });

    const { container } = render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Проверяем, что баннер не отображается
    expect(container.firstChild).toBeNull();
  });

  it('should not render when isLoading is true', () => {
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: true,
      applicableLegislation: PrivacyLegislation.CCPA,
      setCCPAOptOut: jest.fn(),
      isLoading: true,
      error: null,
      settings: { doNotSell: false },
    });

    const { container } = render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Проверяем, что баннер не отображается во время загрузки
    expect(container.firstChild).toBeNull();
  });

  it('should close the banner when Accept is clicked', async () => {
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: false,
      applicableLegislation: PrivacyLegislation.NONE,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
    });

    render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Нажимаем кнопку Accept в обертке act
    await act(async () => {
      fireEvent.click(screen.getByText('Accept'));
    });
    
    // Проверяем, что в localStorage сохранен флаг
    expect(localStorage.getItem('privacyBannerSeen')).toBe('true');
  });

  it('should handle privacy choices for California users', async () => {
    const mockSetCCPAOptOut = jest.fn().mockResolvedValue({});
    
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: true,
      applicableLegislation: PrivacyLegislation.CCPA,
      setCCPAOptOut: mockSetCCPAOptOut,
      isLoading: false,
      error: null,
      settings: { doNotSell: false },
    });

    render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Нажимаем кнопку Do Not Sell в обертке act
    await act(async () => {
      fireEvent.click(screen.getByText('Do Not Sell My Data'));
    });
    
    // Проверяем, что функция была вызвана
    expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    
    // Проверяем, что в localStorage сохранен флаг
    expect(localStorage.getItem('privacyBannerSeen')).toBe('true');
  });

  it('should display error message when there is an error', () => {
    mockUsePrivacySettings.mockReturnValue({
      isCaliforniaUser: true,
      applicableLegislation: PrivacyLegislation.CCPA,
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: new Error('Test error'),
      settings: { doNotSell: false },
    });

    render(<PrivacyBanner />);
    
    // Запускаем эффекты
    act(() => {
      jest.runAllTimers();
    });
    
    // Проверяем, что сообщение об ошибке отображается
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
}); 