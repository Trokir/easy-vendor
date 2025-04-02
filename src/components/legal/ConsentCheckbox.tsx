import React from 'react';
import { FormControlLabel, Checkbox, Link, Typography } from '@mui/material';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  label?: string;
  required?: boolean;
  termsLink?: string;
  privacyLink?: string;
  disabled?: boolean;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onChange,
  error,
  label = 'I accept the',
  required = true,
  termsLink = '/terms',
  privacyLink = '/privacy',
  disabled = false,
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          color={error ? 'error' : 'primary'}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          data-testid="checkbox-container"
        />
      }
      label={
        <Typography component="span" color={error ? 'error' : 'textPrimary'}>
          {label}{' '}
          <Link href={termsLink} target="_blank" rel="noopener noreferrer">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href={privacyLink} target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </Link>
        </Typography>
      }
      sx={{ mt: 2 }}
    />
  );
};
