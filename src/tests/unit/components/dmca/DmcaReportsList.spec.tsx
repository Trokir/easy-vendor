import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import DmcaReportsList from '../../../../components/dmca/DmcaReportsList';

// Мокируем react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Мокируем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Мокируем date-fns
jest.mock('date-fns', () => ({
  format: jest.fn().mockImplementation(() => '01.01.2025 10:00'),
}));

describe('DmcaReportsList', () => {
  const mockReports = [
    {
      id: 'test-id-1',
      claimantName: 'Иван Иванов',
      claimantEmail: 'ivan@example.com',
      contentUrl: 'https://example.com/content1',
      originalWorkUrl: 'https://example.com/original1',
      description: 'Описание нарушения 1',
      isSwornStatement: true,
      status: 'pending',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    },
    {
      id: 'test-id-2',
      claimantName: 'Петр Петров',
      claimantEmail: 'petr@example.com',
      contentUrl: 'https://example.com/content2',
      originalWorkUrl: 'https://example.com/original2',
      description: 'Описание нарушения 2',
      isSwornStatement: true,
      status: 'reviewing',
      createdAt: '2025-01-02T10:00:00Z',
      updatedAt: '2025-01-02T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Мокируем успешный ответ axios для загрузки отчетов
    mockedAxios.get.mockResolvedValue({ data: mockReports });
  });

  it('отображает список DMCA отчетов', async () => {
    render(<DmcaReportsList />);
    
    // Проверяем, что отображается индикатор загрузки
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('DMCA Отчеты')).toBeInTheDocument();
    });
    
    // Проверяем, что отчеты отображаются в таблице
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Петр Петров')).toBeInTheDocument();
    expect(screen.getByText('В ожидании')).toBeInTheDocument();
    expect(screen.getByText('На рассмотрении')).toBeInTheDocument();
    
    // Проверяем, что запрос был отправлен
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/dmca-reports');
  });

  it('отображает сообщение об ошибке при неудачной загрузке данных', async () => {
    // Мокируем ошибку при загрузке данных
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<DmcaReportsList />);
    
    // Ждем появления сообщения об ошибке
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить DMCA отчеты')).toBeInTheDocument();
    });
  });

  it('открывает диалог редактирования при нажатии на кнопку редактирования', async () => {
    render(<DmcaReportsList />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Нажимаем на кнопку редактирования первого отчета
    const editButtons = screen.getAllByTitle('Изменить статус');
    fireEvent.click(editButtons[0]);
    
    // Проверяем, что открылся диалог редактирования
    expect(screen.getByText('Изменить статус DMCA отчета')).toBeInTheDocument();
    
    // Проверяем наличие полей в диалоге
    expect(screen.getByLabelText('Статус')).toBeInTheDocument();
    expect(screen.getByLabelText('Заметки администратора')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
  });

  it('успешно обновляет статус отчета', async () => {
    // Мокируем успешный ответ при обновлении отчета
    mockedAxios.patch.mockResolvedValueOnce({
      data: {
        ...mockReports[0],
        status: 'valid',
        adminNotes: 'Проверено и подтверждено',
      },
    });
    
    render(<DmcaReportsList />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Нажимаем на кнопку редактирования первого отчета
    const editButtons = screen.getAllByTitle('Изменить статус');
    fireEvent.click(editButtons[0]);
    
    // Меняем статус
    const statusField = screen.getByLabelText('Статус');
    fireEvent.mouseDown(statusField);
    const validOption = screen.getByText('Подтверждено');
    fireEvent.click(validOption);
    
    // Добавляем заметку
    const notesField = screen.getByLabelText('Заметки администратора');
    fireEvent.change(notesField, { target: { value: 'Проверено и подтверждено' } });
    
    // Сохраняем изменения
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    
    // Проверяем, что запрос был отправлен с правильными данными
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/dmca-reports/test-id-1', {
        status: 'valid',
        adminNotes: 'Проверено и подтверждено',
      });
    });
  });

  it('открывает диалог подтверждения при нажатии на кнопку удаления', async () => {
    render(<DmcaReportsList />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Нажимаем на кнопку удаления первого отчета
    const deleteButtons = screen.getAllByTitle('Удалить');
    fireEvent.click(deleteButtons[0]);
    
    // Проверяем, что открылся диалог подтверждения
    expect(screen.getByText('Подтверждение удаления')).toBeInTheDocument();
    expect(screen.getByText(/Вы уверены, что хотите удалить DMCA отчет/)).toBeInTheDocument();
  });

  it('успешно удаляет отчет', async () => {
    // Мокируем успешный ответ при удалении отчета
    mockedAxios.delete.mockResolvedValueOnce({});
    
    render(<DmcaReportsList />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Нажимаем на кнопку удаления первого отчета
    const deleteButtons = screen.getAllByTitle('Удалить');
    fireEvent.click(deleteButtons[0]);
    
    // Подтверждаем удаление
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    
    // Проверяем, что запрос был отправлен с правильным ID
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/dmca-reports/test-id-1');
    });
  });
}); 