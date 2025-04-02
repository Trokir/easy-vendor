# CCPA Compliance Implementation Roadmap

## Overview

The California Consumer Privacy Act (CCPA) requires businesses to provide California residents with the right to know what personal information is collected, to delete personal information, and to opt out of the sale of personal information. This roadmap outlines the implementation strategy for ensuring Easy Vendor's compliance with CCPA.

**Issue**: #54 - Implement CCPA Compliance
**Sprint**: Sprint 2: Templates & Content
**Priority**: High
**Estimated Completion**: 06.04.2025

## Technical Architecture

### Component Structure

```
src/
├── components/
│   └── legal/
│       ├── CCPABanner.tsx            // Notification banner for California users
│       ├── CCPABanner.test.tsx       // Tests for the banner component
│       ├── DoNotSellPage.tsx         // "Do Not Sell My Info" page component
│       └── DoNotSellPage.test.tsx    // Tests for the "Do Not Sell" page
├── services/
│   └── privacy/
│       ├── ccpaService.ts            // Service for handling CCPA-related functions
│       └── ccpaService.test.ts       // Tests for CCPA service
├── hooks/
│   └── usePrivacySettings.ts         // Hook for accessing user privacy preferences
├── contexts/
│   └── PrivacyContext.tsx            // Context provider for privacy settings
└── utils/
    ├── geoLocation.ts                // Utilities for determining user's location
    └── privacyUtils.ts               // Helper functions for privacy features
```

### Data Flow

1. **User Identification**:
   - Detect if the user is from California using:
     - IP-based geolocation (production)
     - User-region localStorage flag (for testing)

2. **Consent Management**:
   - Store CCPA preferences in:
     - localStorage (temporary storage)
     - User database record (persistent storage)
   - Track data sale opt-out preferences with timestamp

3. **API Endpoints**:
   - `POST /api/privacy/ccpa/opt-out`: Record user's opt-out preference
   - `GET /api/privacy/ccpa/status`: Check user's current CCPA status
   - `DELETE /api/privacy/data`: Request personal data deletion

## Implementation Tasks

### 1. CCPA Banner Component

**Description**: Create a notification banner specifically for California users informing them of their CCPA rights.

**Technical Specifications**:
- React functional component with TypeScript
- Material-UI styling for consistent UI
- Conditional rendering based on user's location and consent status
- Local storage integration for preference persistence
- Responsive design (mobile and desktop layouts)

**Features**:
- "Accept" button to acknowledge the notification
- "Do Not Sell My Info" button for immediate opt-out
- Link to the Privacy Policy
- Link to the "Do Not Sell" page for more information

**Behavior**:
- Display only to users identified as California residents
- Remember user's choice using localStorage
- Support multiple positions (top/bottom of screen)

### 2. "Do Not Sell My Personal Information" Page

**Description**: Create a dedicated page explaining CCPA rights and providing mechanisms to opt out of personal data sales.

**Technical Specifications**:
- React functional component with TypeScript
- Form elements for submitting opt-out requests
- Integration with API endpoints
- Accessibility compliance (WCAG 2.1)
- SEO optimized with appropriate meta tags

**Page Content**:
- Explanation of CCPA rights
- Categories of personal information collected
- Categories of third parties with whom information is shared
- Opt-out form with verification mechanism
- Contact information for privacy-related questions

**User Flow**:
1. User accesses the "Do Not Sell" page
2. User reviews information about data collection practices
3. User submits opt-out request via form
4. System verifies request
5. System confirms opt-out status
6. User receives confirmation (on-screen and via email)

### 3. Privacy Policy Updates

**Description**: Update the existing privacy policy to include CCPA-specific disclosures.

**Required Additions**:
- CCPA-specific rights section
- Categories of personal information collected in the last 12 months
- Categories of personal information sold or disclosed in the last 12 months
- Right to know and access personal information
- Right to deletion
- Right to opt-out of sale
- Right to non-discrimination
- Methods for submitting requests
- Verification process

**Technical Implementation**:
- Update `docs/legal/privacy-policy.md`
- Add CCPA section to Privacy Policy React component
- Include last updated timestamp
- Version control for policy changes

### 4. Opt-Out Mechanism

**Description**: Implement backend services to handle opt-out requests and maintain user preferences.

**Technical Specifications**:
- RESTful API endpoints in NestJS
- Database schema updates for storing preferences
- Service layer for business logic
- Integration with email notification system

**Database Changes**:
```typescript
// New entity for CCPA preferences
export class UserPrivacyPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ default: false })
  ccpaOptOut: boolean;

  @Column({ nullable: true })
  optOutDate: Date;

  @Column({ nullable: true })
  region: string;

  @Column({ default: false })
  dataDeleteRequested: boolean;

  @Column({ nullable: true })
  deleteRequestDate: Date;

  @Column({ type: 'json', nullable: true })
  additionalPreferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**API Endpoints**:
- `POST /api/privacy/ccpa/opt-out`: Record user's opt-out preference
  - Request: `{ userId: number }`
  - Response: `{ success: boolean, timestamp: Date }`

- `GET /api/privacy/ccpa/status`: Get user's current opt-out status
  - Request: `{ userId: number }`
  - Response: `{ optedOut: boolean, timestamp: Date | null }`

- `POST /api/privacy/data-deletion`: Request personal data deletion
  - Request: `{ userId: number, reason?: string }`
  - Response: `{ requestId: string, estimatedCompletionDate: Date }`

### 5. User Geolocation Detection

**Description**: Implement mechanism to identify California users.

**Technical Approach**:
- Primary: IP-based geolocation using MaxMind GeoIP or similar service
- Fallback: User self-identification through region selection
- Testing: localStorage flag for simulating California users

**Implementation Steps**:
1. Integrate geolocation service with application
2. Create middleware to attach location info to requests
3. Implement caching to minimize API calls
4. Create utility functions for location checking

## Testing Strategy

### Unit Tests
- Test CCPABanner component rendering
- Test DoNotSellPage component rendering and form submission
- Test CCPA service functions
- Test user preference persistence

### Integration Tests
- Test geolocation service integration
- Test API endpoints for CCPA preferences
- Test database operations for privacy preferences

### E2E Tests
- Complete user flow from banner to opt-out completion
- Form submission and validation
- Preference persistence across sessions

## Deployment Plan

1. **Phase 1 - Development**:
   - Implement all components and services in feature branch
   - Conduct code reviews
   - Run unit and integration tests

2. **Phase 2 - QA**:
   - Manual testing with simulated California locations
   - Legal review of privacy policy updates
   - Fix any issues identified

3. **Phase 3 - Deployment**:
   - Deploy database migrations first
   - Deploy backend services
   - Deploy frontend components
   - Enable feature flags to control rollout

4. **Phase 4 - Monitoring**:
   - Monitor opt-out requests
   - Track metrics for California user engagement
   - Collect feedback for further improvements

## Compliance Verification

- Review implementation against CCPA requirements
- Conduct regular audits of data handling practices
- Maintain records of compliance measures
- Provide training for team members on handling CCPA requests

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inaccurate geolocation | Medium | High | Implement self-identification option |
| Improper data deletion | Low | High | Create thorough testing for deletion processes |
| Privacy policy inadequacy | Medium | High | Legal review before deployment |
| Performance impact from additional checks | Low | Medium | Optimize code and employ caching |
| User confusion about rights | Medium | Medium | Clear, concise UI and helpful explanations |

## Resources

- [Official CCPA Text](https://oag.ca.gov/privacy/ccpa)
- [CCPA Regulations](https://oag.ca.gov/privacy/ccpa/regs)
- [MDN Web Docs - Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Context API](https://reactjs.org/docs/context.html)
- [Material-UI Documentation](https://mui.com/getting-started/usage/)

## Timeline

| Task | Start Date | End Date | Dependencies |
|------|------------|----------|--------------|
| CCPA Banner Component | 02.04.2025 | 03.04.2025 | None |
| Privacy Policy Updates | 03.04.2025 | 04.04.2025 | None |
| Opt-Out Mechanism (Backend) | 03.04.2025 | 05.04.2025 | Database schema updates |
| "Do Not Sell" Page | 04.04.2025 | 05.04.2025 | CCPA Banner, Opt-Out API |
| User Geolocation Detection | 04.04.2025 | 05.04.2025 | None |
| Testing & Bug Fixes | 05.04.2025 | 06.04.2025 | All components |
| Deployment | 06.04.2025 | 06.04.2025 | Testing completion | 