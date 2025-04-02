import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithMui } from '../../tests/utils/mui-test-utils';
import { PrivacyChoicesPage } from '../../components/legal/PrivacyChoicesPage';
import { mockServer, handlers } from '../mocks/msw-handlers';
import { PrivacyContext } from '../../contexts/PrivacyContext';
import { mockPrivacyContext, createPrivacyContextMock } from '../mocks/privacy-context.mock';

// Мокируем сервер API
const server = mockServer;

// Компонент-обертка для предоставления контекста
const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PrivacyContext.Provider value={mockPrivacyContext}>
    {children}
  </PrivacyContext.Provider>
);

describe('PrivacyChoicesPage - Интеграционные тесты', () => {
  // Запуск мок-сервера перед всеми тестами
  beforeAll(() => {
    server.listen();
  });

  // Сброс обработчиков после каждого теста
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  // Завершение работы сервера после всех тестов
  afterAll(() => {
    server.close();
  });

  it('должен отправлять запрос на отказ от продажи данных и показывать успешное сообщение', async () => {
    // Рендеринг компонента с контекстом
    renderWithMui(
      <TestProvider>
        <PrivacyChoicesPage />
      </TestProvider>
    );

    // Проверяем, что компонент отрендерен с правильным заголовком
    expect(screen.getByText('California Consumer Privacy Act (CCPA)')).toBeInTheDocument();

    // Заполняем форму
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Выбираем опцию opt-out из продажи данных
    const optOutRadios = screen.getAllByRole('radio');
    const optOutRadio = optOutRadios.find(radio => 
      radio.getAttribute('value') === 'optOut'
    );
    
    if (optOutRadio) {
      fireEvent.click(optOutRadio);
    }

    // Отправляем форму
    const submitButton = screen.getByText('Submit Request');
    fireEvent.click(submitButton);

    // Проверяем, что функция setCCPAOptOut была вызвана
    await waitFor(() => {
      expect(mockPrivacyContext.setCCPAOptOut).toHaveBeenCalledWith(true);
    });

    // Проверяем, что отображается сообщение об успехе
    await waitFor(() => {
      expect(screen.getByText('Your request has been processed successfully.')).toBeInTheDocument();
    });
  });

  it('должен правильно обрабатывать запрос на удаление данных', async () => {
    // Создаем специальный мок с возможностью отслеживания updateSettings
    const contextMock = createPrivacyContextMock();
    const mockUpdateSettings = contextMock.updateSettings as jest.Mock;

    // Рендерим с кастомным провайдером для этого теста
    renderWithMui(
      <PrivacyContext.Provider value={contextMock}>
        <PrivacyChoicesPage />
      </PrivacyContext.Provider>
    );

    // Заполняем форму
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Выбираем опцию удаления данных
    const deleteRadios = screen.getAllByRole('radio');
    const deleteRadio = deleteRadios.find(radio => 
      radio.getAttribute('value') === 'delete'
    );
    
    if (deleteRadio) {
      fireEvent.click(deleteRadio);
    }

    // Отправляем форму
    const submitButton = screen.getByText('Submit Request');
    fireEvent.click(submitButton);

    // Проверяем, что функция updateSettings была вызвана с правильными параметрами
    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ 
        dataDeleteRequested: true,
      }));
    });

    // Проверяем, что отображается сообщение об успехе
    await waitFor(() => {
      expect(screen.getByText('Your request has been processed successfully.')).toBeInTheDocument();
    });
  });

  it('должен отображать ошибку, если API запрос не удался', async () => {
    // Создаем специальный мок, который выбрасывает ошибку
    const errorContext = createPrivacyContextMock();
    (errorContext.setCCPAOptOut as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    // Рендерим с кастомным провайдером для этого теста
    renderWithMui(
      <PrivacyContext.Provider value={errorContext}>
        <PrivacyChoicesPage />
      </PrivacyContext.Provider>
    );

    // Заполняем форму
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Выбираем опцию opt-out из продажи данных
    const optOutRadios = screen.getAllByRole('radio');
    const optOutRadio = optOutRadios.find(radio => 
      radio.getAttribute('value') === 'optOut'
    );
    
    if (optOutRadio) {
      fireEvent.click(optOutRadio);
    }

    // Отправляем форму
    const submitButton = screen.getByText('Submit Request');
    fireEvent.click(submitButton);

    // Проверяем, что отображается сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('An error occurred while processing your request. Please try again later.')).toBeInTheDocument();
    });
  });
}); 