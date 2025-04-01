# Frontend Documentation

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   │   └── RegisterForm.tsx
│   ├── legal/           # Legal consent components
│   │   ├── ConsentCheckbox.tsx
│   │   └── CookieBanner.tsx
│   └── layout/          # Layout components
│       └── CookieConsent.tsx
├── hooks/               # Custom React hooks
│   └── useConsent.ts
├── services/           # API services
│   └── legal-consent/  # Legal consent service
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Components

### ConsentCheckbox

A reusable checkbox component for legal consent forms.

```tsx
<ConsentCheckbox
  checked={accepted}
  onChange={setAccepted}
  error={!!error}
  label="I accept the"
/>
```

Props:
- `checked`: boolean - Whether the checkbox is checked
- `onChange`: (checked: boolean) => void - Callback when checkbox state changes
- `error`: boolean - Whether to show error state
- `label`: string - Custom label text
- `required`: boolean - Whether the checkbox is required

### CookieBanner

A banner component for cookie consent.

```tsx
<CookieBanner
  open={showBanner}
  onAccept={handleAccept}
  onDecline={handleDecline}
  message="We use cookies..."
  policyLink="/legal/cookies"
/>
```

Props:
- `open`: boolean - Whether the banner is visible
- `onAccept`: () => void - Callback when user accepts
- `onDecline`: () => void - Callback when user declines
- `message`: string - Custom message text
- `policyLink`: string - Link to cookie policy
- `acceptButtonText`: string - Custom accept button text
- `declineButtonText`: string - Custom decline button text
- `learnMoreButtonText`: string - Custom learn more button text

### RegisterForm

A registration form with legal consent integration.

```tsx
<RegisterForm
  onSubmit={handleSubmit}
  onError={handleError}
/>
```

Props:
- `onSubmit`: (data: { email: string; password: string }) => Promise<void> - Form submission handler
- `onError`: (error: string) => void - Error handler

### CookieConsent

A wrapper component for cookie consent banner.

```tsx
<CookieConsent onError={handleError} />
```

Props:
- `onError`: (error: string) => void - Error handler

## Hooks

### useConsent

A custom hook for managing legal consents.

```tsx
const { isAccepted, isLoading, error, recordConsent, checkConsent } = useConsent({
  userId: 'user-id',
  consentType: 'terms',
  version: '1.0',
  onError: handleError,
});
```

Options:
- `userId`: string - User ID
- `consentType`: ConsentType - Type of consent
- `version`: string - Version of consent
- `onError`: (error: string) => void - Error handler

Returns:
- `isAccepted`: boolean - Whether consent is accepted
- `isLoading`: boolean - Loading state
- `error`: string | null - Error message
- `recordConsent`: (metadata?: Record<string, any>) => Promise<boolean> - Record consent
- `checkConsent`: () => Promise<void> - Check consent status

## Usage Examples

### Registration Form with Terms Acceptance

```tsx
import { RegisterForm } from './components/auth/RegisterForm';

const RegisterPage = () => {
  const handleSubmit = async (data) => {
    // Handle registration
  };

  const handleError = (error) => {
    // Handle errors
  };

  return (
    <RegisterForm
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};
```

### Cookie Consent Banner

```tsx
import { CookieConsent } from './components/layout/CookieConsent';

const App = () => {
  const handleError = (error) => {
    // Handle errors
  };

  return (
    <>
      {/* App content */}
      <CookieConsent onError={handleError} />
    </>
  );
};
```

## Styling

The components use Material-UI for styling. You can customize the theme by:

1. Creating a theme file:
```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // Custom theme options
});
```

2. Applying the theme:
```tsx
// src/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

const App = () => (
  <ThemeProvider theme={theme}>
    {/* App content */}
  </ThemeProvider>
);
```

## Testing

Components can be tested using Jest and React Testing Library:

```tsx
// src/components/legal/ConsentCheckbox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentCheckbox } from './ConsentCheckbox';

describe('ConsentCheckbox', () => {
  it('renders correctly', () => {
    render(<ConsentCheckbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles changes', () => {
    const onChange = jest.fn();
    render(<ConsentCheckbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Update documentation
5. Submit a pull request

## License

MIT 