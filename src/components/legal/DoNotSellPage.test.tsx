import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DoNotSellPage } from './DoNotSellPage';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';

// Mock usePrivacySettings hook
jest.mock('../../hooks/usePrivacySettings');

const mockUsePrivacySettings = usePrivacySettings as jest.MockedFunction<typeof usePrivacySettings>;

describe('DoNotSellPage', () => {
  const theme = createTheme();
  
  beforeEach(() => {
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

  it('displays all main page sections', () => {
    render(
      <ThemeProvider theme={theme}>
        <DoNotSellPage />
      </ThemeProvider>
    );

    expect(screen.getByText('Do Not Sell My Personal Information')).toBeInTheDocument();
    expect(screen.getByText('What data we collect')).toBeInTheDocument();
    expect(screen.getByText('How we use your data')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Opt-out of selling data' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Additional information' })).toBeInTheDocument();
  });

  it('displays the opt-out form', () => {
    render(
      <ThemeProvider theme={theme}>
        <DoNotSellPage />
      </ThemeProvider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opt-out of selling data' })).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
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
        <DoNotSellPage />
      </ThemeProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: 'Opt-out of selling data' });

    // Используем act для обертывания операций, изменяющих состояние
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockSetCCPAOptOut).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(screen.getByText('Your request to opt-out of selling data has been processed successfully.')).toBeInTheDocument();
    });
  });

  it('handles form submission error', async () => {
    const mockSetCCPAOptOut = jest.fn().mockRejectedValue(new Error('API Error'));
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
        <DoNotSellPage />
      </ThemeProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: 'Opt-out of selling data' });

    // Используем act для обертывания операций, изменяющих состояние
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('An error occurred while processing your request. Please try again later.')).toBeInTheDocument();
    });
  });

  it('displays "Opt-out already completed" state if user has already opted out', () => {
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
        <DoNotSellPage />
      </ThemeProvider>
    );

    expect(screen.getByText('Opt-out already completed')).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(
      <ThemeProvider theme={theme}>
        <DoNotSellPage />
      </ThemeProvider>
    );

    expect(screen.getByText(/Email: privacy@easyvendor.com/)).toBeInTheDocument();
    expect(screen.getByText(/Phone: \(555\) 123-4567/)).toBeInTheDocument();
  });
}); 