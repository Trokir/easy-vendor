import React from 'react';
import { renderWithProviders, screen, fireEvent, waitForComponentToPaint } from '../../mocks/test-utils';
import { ConsentCheckbox } from './ConsentCheckbox';
import { LegalConsentContext } from '../../mocks/context';

describe('ConsentCheckbox', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
      />
    );
    
    await waitForComponentToPaint();
    expect(screen.getByText(/I accept the/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
  
  it('calls onChange when clicked', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
      />
    );
    
    await waitForComponentToPaint();
    fireEvent.click(screen.getByRole('checkbox'));
    await waitForComponentToPaint();
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
  
  it('can be pre-checked', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={true}
        onChange={mockOnChange}
      />
    );
    
    await waitForComponentToPaint();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
  
  it('displays link to terms when provided', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
        termsLink="/custom-terms"
      />
    );
    
    await waitForComponentToPaint();
    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.closest('a')).toHaveAttribute('href', '/custom-terms');
  });
  
  it('can be disabled', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
        disabled={true}
      />
    );
    
    await waitForComponentToPaint();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
  
  it('displays error state', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
        error={true}
      />
    );
    
    await waitForComponentToPaint();
    // Проверка, что checkbox использует color="error"
    const checkbox = screen.getByTestId('checkbox-container');
    expect(checkbox).toHaveClass('MuiCheckbox-colorError');
  });
  
  it('is required by default', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
      />
    );
    
    await waitForComponentToPaint();
    expect(screen.getByRole('checkbox')).toBeRequired();
  });
  
  it('can be optional', async () => {
    renderWithProviders(
      <ConsentCheckbox
        label="I accept the"
        checked={false}
        onChange={mockOnChange}
        required={false}
      />
    );
    
    await waitForComponentToPaint();
    expect(screen.getByRole('checkbox')).not.toBeRequired();
  });
});
