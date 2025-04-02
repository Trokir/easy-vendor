import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { CCPABanner } from './CCPABanner';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';

// Mock usePrivacySettings hook
jest.mock('../../hooks/usePrivacySettings');

const mockUsePrivacySettings = usePrivacySettings as jest.MockedFunction<typeof usePrivacySettings>;

describe('CCPABanner', () => {
  const theme = createTheme();
  let originalLocalStorage: Storage;
  
  beforeEach(() => {
    // Сохраняем оригинальный localStorage
    originalLocalStorage = global.localStorage;
    
    // Мокируем localStorage
    const localStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(() => null),
    };
    
    Object.defineProperty(global, 'localStorage', { value: localStorageMock });
    
    // Configure usePrivacySettings hook mock
    mockUsePrivacySettings.mockReturnValue({
      settings: {
        doNotSell: false,
        email: '',
        lastUpdated: new Date().toISOString(),
      },
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      updateSettings: jest.fn(),
      isCaliforniaUser: true,
    });
  });
  
  afterEach(() => {
    // Восстанавливаем оригинальный localStorage
    Object.defineProperty(global, 'localStorage', { value: originalLocalStorage });
  });

  it('should not display for non-California users', () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {
        doNotSell: false,
        email: '',
        lastUpdated: new Date().toISOString(),
      },
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      updateSettings: jest.fn(),
      isCaliforniaUser: false,
    });

    render(
      <ThemeProvider theme={theme}>
        <CCPABanner />
      </ThemeProvider>
    );

    expect(screen.queryByText('Do Not Sell My Data')).not.toBeInTheDocument();
  });

  it('should display for California users', () => {
    render(
      <ThemeProvider theme={theme}>
        <CCPABanner />
      </ThemeProvider>
    );

    expect(screen.getByText('Do Not Sell My Data')).toBeInTheDocument();
  });

  it('should close when Accept button is clicked', async () => {
    const mockSetCCPAOptOut = jest.fn();
    mockUsePrivacySettings.mockReturnValue({
      settings: {
        doNotSell: false,
        email: '',
        lastUpdated: new Date().toISOString(),
      },
      setCCPAOptOut: mockSetCCPAOptOut,
      isLoading: false,
      error: null,
      updateSettings: jest.fn(),
      isCaliforniaUser: true,
    });

    render(
      <ThemeProvider theme={theme}>
        <CCPABanner />
      </ThemeProvider>
    );

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    
    // Act pattern для асинхронных операций
    await act(async () => {
      fireEvent.click(acceptButton);
    });
    
    // Проверяем, что localStorage был вызван
    expect(localStorage.setItem).toHaveBeenCalledWith('ccpaBannerSeen', 'true');
  });

  it('should call setCCPAOptOut when Do Not Sell button is clicked', async () => {
    const mockSetCCPAOptOut = jest.fn().mockResolvedValue({ success: true });
    mockUsePrivacySettings.mockReturnValue({
      settings: {
        doNotSell: false,
        email: '',
        lastUpdated: new Date().toISOString(),
      },
      setCCPAOptOut: mockSetCCPAOptOut,
      isLoading: false,
      error: null,
      updateSettings: jest.fn(),
      isCaliforniaUser: true,
    });

    render(
      <ThemeProvider theme={theme}>
        <CCPABanner />
      </ThemeProvider>
    );

    const doNotSellButton = screen.getByRole('button', { name: /do not sell/i });
    
    await act(async () => {
      fireEvent.click(doNotSellButton);
    });

    expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('ccpaBannerSeen', 'true');
  });

  it('should not display if user has already seen the banner', () => {
    // Меняем мок, чтобы имитировать уже виденный баннер
    (localStorage.getItem as jest.Mock).mockReturnValue('true');
    
    mockUsePrivacySettings.mockReturnValue({
      settings: {
        doNotSell: false,
        email: '',
        lastUpdated: new Date().toISOString(),
      },
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      updateSettings: jest.fn(),
      isCaliforniaUser: true,
    });

    render(
      <ThemeProvider theme={theme}>
        <CCPABanner />
      </ThemeProvider>
    );

    expect(screen.queryByText('Do Not Sell My Data')).not.toBeInTheDocument();
  });
  
  it('should not display if user has already opted out', () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {
        doNotSell: true,
        email: '',
        lastUpdated: new Date().toISOString(),
      },
      setCCPAOptOut: jest.fn(),
      isLoading: false,
      error: null,
      updateSettings: jest.fn(),
      isCaliforniaUser: true,
    });

    render(
      <ThemeProvider theme={theme}>
        <CCPABanner />
      </ThemeProvider>
    );

    expect(screen.queryByText('Do Not Sell My Data')).not.toBeInTheDocument();
  });
}); 