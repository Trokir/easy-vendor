# Testing Guide for Easy Vendor

## Overview

This project uses Vitest as the testing framework, with separate test suites for frontend and backend components. Tests are organized in a structured manner to ensure maximum coverage and maintainability.

## Test Structure

```
tests/
├── frontend/           # Tests for React components and frontend utilities
│   ├── components/     # Component tests (organized by feature)
│   ├── hooks/          # Custom hooks tests
│   ├── utils/          # Frontend utility function tests
│   └── contexts/       # Context tests
├── backend/            # Tests for backend services and APIs
│   ├── controllers/    # Controller tests
│   ├── services/       # Service tests
│   ├── middleware/     # Middleware tests
│   └── utils/          # Backend utility function tests
└── setup.ts            # Global test setup and mocks
```

## Running Tests

### All Tests

```bash
npm test
```

### Frontend Tests Only

```bash
npm run test:frontend
```

### Backend Tests Only

```bash
npm run test:backend
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Reports

```bash
npm run test:coverage
```

After running the coverage command, a detailed report will be available in the `coverage` directory.

## Writing Tests

### Frontend Component Tests

Frontend component tests use React Testing Library to simulate user interactions and verify component behavior.

Example:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SomeComponent } from '@/components/SomeComponent';

describe('SomeComponent', () => {
  it('renders correctly', () => {
    render(<SomeComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockFn = vi.fn();
    render(<SomeComponent onClick={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

### Backend Tests

Backend tests focus on testing API endpoints, services, and utility functions.

Example:

```ts
import { describe, it, expect, vi } from 'vitest';
import { SomeService } from '@/services/SomeService';

describe('SomeService', () => {
  it('performs expected operation', async () => {
    const result = await SomeService.doSomething('input');
    expect(result).toBe('expected output');
  });

  it('handles errors appropriately', async () => {
    // Mock dependencies
    vi.spyOn(someModule, 'someFunction').mockRejectedValueOnce(new Error('Test error'));
    
    // Test error handling
    await expect(SomeService.doSomething('input')).rejects.toThrow('Test error');
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent of others.
2. **One assertion per test**: Keep tests focused on a single aspect of behavior.
3. **Use mocks appropriately**: Mock external dependencies but not the code under test.
4. **Test edge cases**: Include tests for error conditions, boundary cases, etc.
5. **Keep tests simple**: Tests should be easy to understand and maintain.
6. **Use meaningful test names**: Names should describe what the test verifies.
7. **Follow AAA pattern**: Arrange, Act, Assert.

## Coverage Goals

- **Components**: 90%+ coverage
- **Services**: 85%+ coverage
- **Utilities**: 95%+ coverage
- **Overall**: 80%+ coverage

## Current Test Coverage

**Last Updated**: 04.04.2025
**Overall Coverage**: 15.78% (initial phase)

| Category | Coverage | Notes |
|----------|----------|-------|
| Frontend | CCPABanner: 94.4%, DoNotSellPage: 92.82%, PrivacyChoicesPage: 92.58%, PrivacyBanner: 98%, CookieBanner: 100%, ConsentCheckbox: 100% | High coverage for tested components |
| Backend  | CCPAService: 75%, GeoLocationService: 91.72%, CCPAController: 100% | Good coverage of core service functions |
| Components | 6/6 | Legal components testing: All components covered by tests |
| Hooks | usePrivacySettings: 87.2%, useConsent: Interface validated (implementation coverage pending due to technical constraints) | Privacy hooks: 2/2 hooks tested |
| Services | 3/? | Privacy services testing: CCPAService, GeoLocationService, CCPAController |
| Types | consent.types: 100% | Type definitions: 1/? tested |
| Branches | CCPABanner: 70.83%, DoNotSellPage: 76.19%, CCPAService: 91.66%, GeoLocationService: 83.33%, PrivacyChoicesPage: 68.42%, PrivacyBanner: 73.91%, CookieBanner: 100%, ConsentCheckbox: 100%, CCPAController: 100%, usePrivacySettings: 72.72% | Branch coverage |
| Functions | CCPABanner: 75%, DoNotSellPage: 80%, CCPAService: 80%, GeoLocationService: 100%, PrivacyChoicesPage: 50%, PrivacyBanner: 75%, CookieBanner: 100%, ConsentCheckbox: 100%, CCPAController: 100%, usePrivacySettings: 100% | Function coverage |

### Components with high coverage
- ✅ CCPABanner: 94.4%
- ✅ DoNotSellPage: 92.82%
- ✅ PrivacyChoicesPage: 92.58%
- ✅ PrivacyBanner: 98%
- ✅ CookieBanner: 100%
- ✅ ConsentCheckbox: 100%

### Hooks with high coverage
- ✅ usePrivacySettings: 87.2%
- ⚠️ useConsent: Interface validated (implementation coverage pending due to technical constraints)

### Services with good coverage
- ✅ CCPAService: 75%
- ✅ GeoLocationService: 91.72%
- ✅ CCPAController: 100%

### Types with 100% coverage
- ✅ consent.types: 100%

### Main areas with test coverage
- ✅ src/components/legal: 94.19% (statements), 74.22% (branches), 68% (functions)
- ✅ src/controllers/privacy: 100% (statements), 100% (branches), 100% (functions)
- ✅ src/services/privacy: 75% (statements), 91.66% (branches), 80% (functions)
- ✅ src/hooks/usePrivacySettings: 87.2% (statements), 72.72% (branches), 100% (functions)
- ✅ src/types/consent.types: 100% (statements), 100% (branches), 100% (functions)

### Overall Results
- 11 test files
- 66 individual tests
- Overall code coverage: 15.78% (from initial 4.47%)
- Overall branch coverage: 45.21%
- Overall function coverage: 23.89%

### Not yet covered by tests
- LegalConsentContext
- PrivacyContext
- Various service components outside the privacy module

### Next Steps for Testing
1. Testing of context providers
2. Expand test coverage to other modules
3. Set up CI/CD pipeline for automated testing

## Troubleshooting

If you encounter issues with tests:

1. Check that all dependencies are installed
2. Verify test setup in `tests/setup.ts`
3. Ensure proper mocking of external dependencies
4. Check for any environment-specific issues

## Contributing

When adding new features, please follow the "test-driven development" approach:
1. Write tests first
2. Implement the feature
3. Verify tests pass
4. Refactor as needed while maintaining test coverage 