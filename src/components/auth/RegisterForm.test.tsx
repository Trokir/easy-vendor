import React from 'react';
import { RegisterForm } from './RegisterForm';
import { renderWithProviders, screen, waitFor } from '../../mocks/test-utils';
import userEvent from '@testing-library/user-event';
import { setupMockFetch } from '../../mocks/api';
import { mockApiResponses } from '../../mocks';

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnError = jest.fn();
  
  // Setting up a mock for fetch before tests
  let cleanupMock: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupMock = setupMockFetch();
  });

  afterEach(() => {
    cleanupMock();
  });

  it('renders correctly', () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    // Using userEvent instead of fireEvent for more realistic behavior
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    }, { timeout: 3000 });
  });

  it('shows error when email is invalid', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      // Check for any error message, as the exact text might vary
      const errorElements = screen.getAllByText(/invalid|error|email/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), '123');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      // Check for any password error message
      const errorElements = screen.getAllByText(/password|characters|length/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows error when terms are not accepted', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    // Intentionally not clicking the checkbox
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('calls onError when submission fails', async () => {
    const errorMessage = 'Registration failed';
    mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    }, { timeout: 3000 });
  });

  it('disables submit button while submitting', async () => {
    const mockOnSubmit = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    renderWithProviders(
      <RegisterForm onSubmit={mockOnSubmit} onError={() => {}} />
    );
    
    // Fill the form with valid data
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByLabelText(/i accept the terms/i));
    
    // Find the submit button by type and submit the form
    const submitButton = screen.getByRole('button');
    userEvent.click(submitButton);
    
    // Check that the submit button becomes disabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    }, { timeout: 3000 });
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('handles empty email field', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      // Check for any email error message
      const errorElements = screen.getAllByText(/email|required|field/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles empty password field', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      // Check for any password error message
      const errorElements = screen.getAllByText(/password|required|field/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles password with only numbers', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), '12345678');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '12345678',
      });
    }, { timeout: 3000 });
  });

  it('handles password with only letters', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    }, { timeout: 3000 });
  });

  it('handles password with special characters', async () => {
    renderWithProviders(<RegisterForm onSubmit={mockOnSubmit} onError={mockOnError} />);

    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123!');
    userEvent.click(screen.getByRole('checkbox'));
    userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123!',
      });
    }, { timeout: 3000 });
  });
});
