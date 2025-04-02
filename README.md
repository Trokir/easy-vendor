# Easy Vendor

A platform for vendor management with support for DMCA reports, consent management, and authentication.

## Features

- Modern React interface with Material UI
- NestJS backend with TypeORM
- Support for legal consents and notifications
- DMCA reports integration
- Advanced authentication and authorization system

## Project Status

Current project status and roadmap are available in [PROJECT_STATUS_REPORT.md](docs/PROJECT_STATUS_REPORT.md).

## Technology Stack

### Frontend
- React 18
- Material UI 5
- React Router 6
- Jest + React Testing Library

### Backend
- NestJS 11
- TypeORM 0.3
- PostgreSQL
- JWT authentication
- SendGrid for email delivery

## Installation and Setup

Detailed setup instructions are available in [PROJECT_SETUP.md](docs/PROJECT_SETUP.md).

1. Clone the repository:
```bash
git clone https://github.com/your-username/easy-vendor.git
cd easy-vendor
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit the .env file, adding the necessary settings
```

4. Start the application in development mode:
```bash
npm start
```

5. Build for production:
```bash
npm run build
```

## Testing

Comprehensive testing guide is available in [TESTING_GUIDE.md](docs/TESTING_GUIDE.md).

### Mocks for Frontend Tests

For testing frontend components without backend interaction, the following mocks have been created:

1. **Service mocks** (`src/mocks/services.ts`):
   - `authServiceMock` - Mock for AuthService
   - `legalConsentServiceMock` - Mock for LegalConsentService
   - `userServiceMock` - Mock for UserService
   - `emailServiceMock` - Mock for EmailService

2. **API mocks** (`src/mocks/api.ts`):
   - `mockApiResponses` - Predefined API responses
   - `mockFetch` - Function for mocking fetch
   - `setupMockFetch` - Function for setting up mocks in tests

3. **Context mocks** (`src/mocks/context.tsx`):
   - `MockAuthProvider` - Mock for authentication context
   - `MockLegalConsentProvider` - Mock for legal consent context
   - `MockUserProvider` - Mock for user context
   - `MockAllProviders` - Combined provider for all contexts

4. **Testing utilities** (`src/mocks/test-utils.tsx`):
   - `renderWithProviders` - Renders a component with theme, router and mocks
   - `renderWithTheme` - Renders a component with theme only
   - `renderWithRouter` - Renders a component with router

### Usage Examples

```typescript
// Import necessary utilities
import { renderWithProviders, screen, fireEvent, waitFor } from '../../mocks/test-utils';
import { setupMockFetch } from '../../mocks/api';

// Example test with API mocking
it('loads user data on component mount', async () => {
  // Setup API mocks
  const cleanupMock = setupMockFetch();
  
  // Render component with mocks
  renderWithProviders(<UserProfile />, {
    initialAuth: { isAuthenticated: true, user: { id: 1 } }
  });
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Ivan Ivanov')).toBeInTheDocument();
  });
  
  // Cleanup after test
  cleanupMock();
});
```

### Running Tests

Use the following commands to run tests:

```bash
# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run all tests
npm run test:all
```

### Run all tests

```bash
npm test
```

### Run a specific test

```bash
npm test path/to/file.test.tsx
```

### Run without watch mode (CI)

```bash
set CI=true && npm test
```

Detailed testing information is available in [TESTING.md](TESTING.md).

## Project Structure

```
easy-vendor/
├── src/
│   ├── components/       # React components
│   ├── services/         # NestJS services
│   ├── controllers/      # NestJS controllers
│   ├── entities/         # TypeORM entities
│   ├── dto/              # Data Transfer Objects
│   ├── tests/            # Tests
│   │   ├── unit/         # Unit tests
│   │   └── integration/  # Integration tests
│   └── utils/            # Utilities
├── public/               # Static files
└── docs/                 # Documentation
    ├── PROJECT_SETUP.md  # Project setup guide
    ├── COMPONENTS_DOCUMENTATION.md # Components documentation
    ├── TESTING_GUIDE.md  # Testing guide
    ├── SPRINT_STATUS.md  # Current sprint status
    ├── SPRINT_AUDIT.md   # Sprint audit report
    ├── PROJECT_STATUS_REPORT.md # Project status report
    └── TROUBLESHOOTING.md # Common issues and solutions
```

## Development Progress

Current development status can be found in [SPRINT_STATUS.md](docs/SPRINT_STATUS.md).
Sprint audit report is available in [SPRINT_AUDIT.md](docs/SPRINT_AUDIT.md).

Information about components can be found in [COMPONENTS_DOCUMENTATION.md](docs/COMPONENTS_DOCUMENTATION.md).

If you encounter any issues, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions.

## License

MIT
