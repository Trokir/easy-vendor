import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivacyChoicesPage } from './PrivacyChoicesPage';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';
import { PrivacyLegislation } from '../../services/geoLocation.service';

// Мокаем хук usePrivacySettings
jest.mock('../../hooks/usePrivacySettings');

describe('PrivacyChoicesPage', () => {
  const mockUsePrivacySettings = usePrivacySettings as jest.Mock;
  const mockUpdateSettings = jest.fn().mockResolvedValue({});
  const mockSetCCPAOptOut = jest.fn().mockResolvedValue({});
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Настраиваем мок по умолчанию
    mockUsePrivacySettings.mockReturnValue({
      settings: {},
      updateSettings: mockUpdateSettings,
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.NONE,
      isLoading: false,
      error: null,
    });
  });

  it('should render loading state', () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {},
      updateSettings: mockUpdateSettings,
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.NONE,
      isLoading: true,
      error: null,
    });

    render(<PrivacyChoicesPage />);
    
    // Проверяем, что загрузчик отображается
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render content for California users', () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {},
      updateSettings: mockUpdateSettings,
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.CCPA,
      isLoading: false,
      error: null,
    });

    render(<PrivacyChoicesPage />);
    
    // Проверяем заголовок и содержимое
    expect(screen.getByText('California Consumer Privacy Act (CCPA)')).toBeInTheDocument();
    expect(screen.getByText(/The CCPA gives California residents the right/)).toBeInTheDocument();
    expect(screen.getByText('Opt-out of selling data')).toBeInTheDocument();
  });

  it('should render content for Virginia users', () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {},
      updateSettings: mockUpdateSettings,
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.CDPA,
      isLoading: false,
      error: null,
    });

    render(<PrivacyChoicesPage />);
    
    // Проверяем заголовок и содержимое
    expect(screen.getByText('Virginia Consumer Data Protection Act (CDPA)')).toBeInTheDocument();
    expect(screen.getByText(/The CDPA provides Virginia residents with rights/)).toBeInTheDocument();
    expect(screen.getByText('Manage your data rights')).toBeInTheDocument();
  });

  it('should render form validation errors', async () => {
    render(<PrivacyChoicesPage />);
    
    // Получаем кнопку отправки
    const submitButton = screen.getByText('Submit Request');
    
    // Нажимаем кнопку без ввода email
    fireEvent.click(submitButton);
    
    // Проверяем, что отображается ошибка валидации
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should validate email format', () => {
    render(<PrivacyChoicesPage />);
    
    // Находим поле ввода email
    const emailInput = screen.getByLabelText('Email');
    
    // Вводим некорректный email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Нажимаем кнопку отправки
    fireEvent.click(screen.getByText('Submit Request'));
    
    // Проверяем, что отображается ошибка формата email
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('should submit form successfully for CCPA opt-out', async () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {},
      updateSettings: mockUpdateSettings,
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.CCPA,
      isLoading: false,
      error: null,
    });

    render(<PrivacyChoicesPage />);
    
    // Находим поле ввода email
    const emailInput = screen.getByLabelText('Email');
    
    // Вводим корректный email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Выбираем опцию opt-out
    const optOutRadio = screen.getByLabelText('Opt out of selling my data');
    fireEvent.click(optOutRadio);
    
    // Нажимаем кнопку отправки
    fireEvent.click(screen.getByText('Submit Request'));
    
    // Проверяем, что функция была вызвана
    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });
    
    // Проверяем, что уведомление об успехе отображается
    await waitFor(() => {
      expect(screen.getByText('Your request has been processed successfully.')).toBeInTheDocument();
    });
  });

  it('should handle form submission error', async () => {
    const mockError = new Error('Test submission error');
    mockUpdateSettings.mockRejectedValue(mockError);
    
    render(<PrivacyChoicesPage />);
    
    // Находим поле ввода email
    const emailInput = screen.getByLabelText('Email');
    
    // Вводим корректный email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Меняем чекбокс на опт-аут от продажи данных
    const salesCheckbox = screen.getByLabelText('Opt out of selling my data');
    fireEvent.click(salesCheckbox);
    
    // Нажимаем кнопку отправки
    fireEvent.click(screen.getByText('Submit Request'));
    
    // Проверяем, что отображается сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('An error occurred while processing your request. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should display context error when present', () => {
    mockUsePrivacySettings.mockReturnValue({
      settings: {},
      updateSettings: mockUpdateSettings,
      setCCPAOptOut: mockSetCCPAOptOut,
      applicableLegislation: PrivacyLegislation.NONE,
      isLoading: false,
      error: new Error('Context error message'),
    });

    render(<PrivacyChoicesPage />);
    
    // Проверяем, что сообщение об ошибке из контекста отображается
    expect(screen.getByText('Context error message')).toBeInTheDocument();
  });
}); 