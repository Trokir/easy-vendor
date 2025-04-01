import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ConsentCheckbox } from './ConsentCheckbox';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ConsentCheckbox', () => {
  it('renders correctly', () => {
    renderWithTheme(<ConsentCheckbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
  });

  it('handles changes', () => {
    const onChange = jest.fn();
    renderWithTheme(<ConsentCheckbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows error state', () => {
    renderWithTheme(<ConsentCheckbox checked={false} onChange={() => {}} error={true} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('uses custom label', () => {
    const customLabel = 'Custom label';
    renderWithTheme(<ConsentCheckbox checked={false} onChange={() => {}} label={customLabel} />);
    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it('is required by default', () => {
    renderWithTheme(<ConsentCheckbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeRequired();
  });

  it('can be optional', () => {
    renderWithTheme(<ConsentCheckbox checked={false} onChange={() => {}} required={false} />);
    expect(screen.getByRole('checkbox')).not.toBeRequired();
  });
}); 