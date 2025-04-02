# Project Components Documentation

## Frontend Components

### Authentication

#### AuthProvider

**Path:** `src/contexts/AuthContext.tsx`

**Description:** Authentication context provider. Manages user authorization state and provides methods for login, logout, and registration.

**Main methods:**
- `login(email, password)` - user authorization
- `logout()` - log out from the system
- `register(userData)` - new user registration
- `resetPassword(email)` - password reset

**Usage example:**
```tsx
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, isAuthenticated, error } = useAuth();
  
  // Use in component
}
```

### Legal Consent

#### LegalConsentProvider

**Path:** `src/contexts/LegalConsentContext.tsx`

**Description:** Manages user consent state for various legal documents (Terms, Privacy, Cookies).

**Main methods:**
- `acceptConsent(type, version)` - accept a specific consent
- `checkConsent(type)` - check if consent exists
- `getConsentVersion(type)` - get current document version

**Usage example:**
```tsx
import { useLegalConsent } from '../hooks/useLegalConsent';

function CookieBanner() {
  const { acceptConsent, checkConsent } = useLegalConsent();
  
  // Use in component
}
```

### Layout

#### Layout

**Path:** `src/components/layout/Layout.tsx`

**Description:** Main application layout that includes header, footer, and main content.

**Props:**
- `children` - page content
- `pageTitle` - page title

**Usage example:**
```tsx
import Layout from '../components/layout/Layout';

function HomePage() {
  return (
    <Layout pageTitle="Home Page">
      <HomeContent />
    </Layout>
  );
}
```

#### CookieBanner

**Path:** `src/components/legal/CookieBanner.tsx`

**Description:** Banner for obtaining consent to use cookies.

**Parameters:**
- `position` - banner position (`'bottom'` or `'top'`)
- `onAccept` - function called when accepted

**Sprint status:** Component improved in current sprint (PR #45).

## Backend Components

### Authentication

#### AuthModule

**Path:** `src/modules/auth/auth.module.ts`

**Description:** NestJS module responsible for user authentication.

**Providers:**
- `AuthService` - main authentication service
- `JwtStrategy` - JWT authentication strategy
- `LocalStrategy` - local authentication strategy

**Controllers:**
- `AuthController` - handles authentication requests

**Status:** Completed (PR #42).

### Email

#### EmailService

**Path:** `src/services/email.service.ts`

**Description:** Service for sending emails via SendGrid API.

**Main methods:**
- `sendLegalConsentConfirmation(email, type, version, date)` - send agreement acceptance confirmation
- `sendPasswordReset(email, token)` - send password reset email
- `sendRegistrationConfirmation(email)` - send registration confirmation

**Tests:** `src/services/__tests__/email.service.spec.ts` (PR #48).

### Legal Consent

#### LegalConsentController

**Path:** `src/controllers/legal-consent.controller.ts`

**Description:** Controller for managing user consents.

**Main endpoints:**
- `POST /legal-consent` - save new consent
- `GET /legal-consent/:type/current` - get current document version
- `GET /legal-consent/user/:userId` - get all user consents

**Test status:** In the process of fixing (branch `fix/legal-consent-tests`).

## Current Sprint Tasks

### DMCA Integration

**Issue:** [#22](https://github.com/Trokir/easy-vendor/issues/22)

**Description:** Integration of DMCA request processing system.

**Components:**
- `DmcaReportService`
- `DmcaReportController`
- `DmcaReportEntity`

**Status:** In development, tests blocked.

### GDPR Integration

**Related components:**
- `GdprConsentService`
- `DataExportService`
- `PersonalDataController`

**Status:** In progress (branch `feature/gdpr`).

## Testing Templates

### Service Testing

```typescript
// src/services/__tests__/sample.service.spec.ts
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SampleService } from '../sample.service';
import { SampleEntity } from '../../entities/sample.entity';
import { createMockRepository } from '../../utils/typeorm-test-utils';

describe('SampleService', () => {
  let service: SampleService;
  let repository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SampleService,
        {
          provide: getRepositoryToken(SampleEntity),
          useValue: createMockRepository<SampleEntity>()
        }
      ],
    }).compile();

    service = module.get<SampleService>(SampleService);
    repository = module.get(getRepositoryToken(SampleEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests...
});
```

### Controller Testing

```typescript
// src/controllers/__tests__/sample.controller.spec.ts
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { SampleController } from '../sample.controller';
import { SampleService } from '../../services/sample.service';

class MockSampleService {
  findAll = jest.fn().mockResolvedValue([]);
  findOne = jest.fn().mockResolvedValue({});
  // Other methods...
}

describe('SampleController', () => {
  let controller: SampleController;
  let service: MockSampleService;

  beforeEach(async () => {
    service = new MockSampleService();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SampleController],
      providers: [
        {
          provide: SampleService,
          useValue: service
        }
      ],
    }).compile();

    controller = module.get<SampleController>(SampleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Tests...
});
``` 