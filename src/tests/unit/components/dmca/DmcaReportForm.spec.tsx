import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import DmcaReportForm from '../../../../components/dmca/DmcaReportForm';

// Мокируем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DmcaReportForm', () => {
  beforeEach(() => {
    // Очищаем состояние моков перед каждым тестом
    jest.clearAllMocks();
  });

  it('отображает форму с необходимыми полями', () => {
    render(<DmcaReportForm />);
    
    // Проверяем заголовок формы
    expect(screen.getByText('Форма отправки DMCA-отчета')).toBeInTheDocument();
    
    // Проверяем наличие полей ввода
    expect(screen.getByLabelText(/Ваше имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ваш email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email ответчика/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL содержимого/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL оригинального произведения/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Описание нарушения/i)).toBeInTheDocument();
    
    // Проверяем checkbox подтверждения под присягой
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    
    // Проверяем кнопку отправки
    expect(screen.getByRole('button', { name: /Отправить отчет/i })).toBeInTheDocument();
  });

  it('показывает ошибки валидации при отправке пустой формы', async () => {
    render(<DmcaReportForm />);
    
    // Нажимаем кнопку отправки без заполнения полей
    fireEvent.click(screen.getByRole('button', { name: /Отправить отчет/i }));
    
    // Проверяем отображение ошибок валидации
    await waitFor(() => {
      expect(screen.getByText('Имя заявителя обязательно')).toBeInTheDocument();
      expect(screen.getByText('Email заявителя обязателен')).toBeInTheDocument();
      expect(screen.getByText('URL содержимого обязателен')).toBeInTheDocument();
      expect(screen.getByText('URL оригинального произведения обязателен')).toBeInTheDocument();
      expect(screen.getByText('Описание обязательно')).toBeInTheDocument();
      expect(screen.getByText('Необходимо подтвердить под присягой')).toBeInTheDocument();
    });
    
    // Проверяем, что запрос не был отправлен
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('успешно отправляет форму с валидными данными', async () => {
    // Мокируем успешный ответ axios
    mockedAxios.post.mockResolvedValueOnce({});
    
    render(<DmcaReportForm />);
    
    // Заполняем форму
    userEvent.type(screen.getByLabelText(/Ваше имя/i), 'Иван Иванов');
    userEvent.type(screen.getByLabelText(/Ваш email/i), 'ivan@example.com');
    userEvent.type(screen.getByLabelText(/URL содержимого/i), 'https://example.com/content');
    userEvent.type(screen.getByLabelText(/URL оригинального произведения/i), 'https://example.com/original');
    userEvent.type(screen.getByLabelText(/Описание нарушения/i), 'Это мой оригинальный контент, который был скопирован без разрешения. Нарушены мои авторские права.');
    
    // Ставим галочку подтверждения
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /Отправить отчет/i }));
    
    // Проверяем, что запрос был отправлен с правильными данными
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/dmca-reports', {
        claimantName: 'Иван Иванов',
        claimantEmail: 'ivan@example.com',
        respondentEmail: '',
        contentUrl: 'https://example.com/content',
        originalWorkUrl: 'https://example.com/original',
        description: 'Это мой оригинальный контент, который был скопирован без разрешения. Нарушены мои авторские права.',
        isSwornStatement: true
      });
    });
    
    // Проверяем, что появилось сообщение об успешной отправке
    expect(screen.getByText('DMCA-отчет успешно отправлен')).toBeInTheDocument();
  });

  it('показывает ошибку при неудачной отправке формы', async () => {
    // Мокируем ошибку axios
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          message: 'Ошибка сервера'
        }
      }
    });
    
    render(<DmcaReportForm />);
    
    // Заполняем форму
    userEvent.type(screen.getByLabelText(/Ваше имя/i), 'Иван Иванов');
    userEvent.type(screen.getByLabelText(/Ваш email/i), 'ivan@example.com');
    userEvent.type(screen.getByLabelText(/URL содержимого/i), 'https://example.com/content');
    userEvent.type(screen.getByLabelText(/URL оригинального произведения/i), 'https://example.com/original');
    userEvent.type(screen.getByLabelText(/Описание нарушения/i), 'Это мой оригинальный контент, который был скопирован без разрешения. Нарушены мои авторские права.');
    
    // Ставим галочку подтверждения
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /Отправить отчет/i }));
    
    // Проверяем, что появилось сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('Ошибка сервера')).toBeInTheDocument();
    });
  });
}); 