import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConsentCheckbox } from '../../../../src/components/legal/ConsentCheckbox';
import '@testing-library/jest-dom/vitest';

describe('ConsentCheckbox Component', () => {
  it('renders correctly with default props', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    
    render(
      <ConsentCheckbox
        checked={false}
        onChange={onChangeMock}
      />
    );
    
    // Check default text content
    expect(screen.getByText(/I accept the/i)).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    
    // Check links have default URLs
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    
    // Check checkbox is unchecked by default using the input element's checked property
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
  
  it('renders as checked when checked prop is true', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    
    render(
      <ConsentCheckbox
        checked={true}
        onChange={onChangeMock}
      />
    );
    
    // Check checkbox is checked using the input element's checked property
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
  
  it('calls onChange handler when checkbox is clicked', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    
    render(
      <ConsentCheckbox
        checked={false}
        onChange={onChangeMock}
      />
    );
    
    // Find checkbox and click it
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Verify the onChange handler was called with true
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(true);
  });
  
  it('renders with error styling when error prop is true', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    
    render(
      <ConsentCheckbox
        checked={false}
        onChange={onChangeMock}
        error={true}
      />
    );
    
    // Check that checkbox input is part of a component with aria-invalid="true"
    // We can use getByTestId again but just to check for the attribute
    const checkboxContainer = screen.getByTestId('checkbox-container');
    expect(checkboxContainer).toHaveAttribute('aria-invalid', 'true');
  });
  
  it('renders with custom links when provided', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    
    render(
      <ConsentCheckbox
        checked={false}
        onChange={onChangeMock}
        termsLink="/custom-terms"
        privacyLink="/custom-privacy"
      />
    );
    
    // Check links have custom URLs
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/custom-terms');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/custom-privacy');
  });
  
  it('renders with custom label when provided', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    const customLabel = 'By checking this box, I agree to the';
    
    render(
      <ConsentCheckbox
        checked={false}
        onChange={onChangeMock}
        label={customLabel}
      />
    );
    
    // Check custom label text - using a regex instead of exact match
    expect(screen.getByText(new RegExp(customLabel))).toBeInTheDocument();
  });
  
  it('is disabled when disabled prop is true', () => {
    // Create a mock function
    const onChangeMock = vi.fn();
    
    render(
      <ConsentCheckbox
        checked={false}
        onChange={onChangeMock}
        disabled={true}
      />
    );
    
    // Check checkbox is disabled
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    
    // Click the checkbox, the onChange handler should not be called
    fireEvent.click(checkbox);
    expect(onChangeMock).not.toHaveBeenCalled();
  });
}); 