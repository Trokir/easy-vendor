# BEFORE YOU START: Project Context & AI Protection

## Project Overview

**Project Name**: Easy Vendor
**Current Status**: Sprint 2 (Templates & Content) - 85% complete
**Repository**: https://github.com/Trokir/easy-vendor
**Current Branch**: dev

## Key Facts (DO NOT HALLUCINATE)

- **Backend Port**: 3003
- **Frontend Port**: 3004
- **Testing Framework**: Vitest (migrated from Jest)
- **Database**: MongoDB
- **Authentication**: JWT-based
- **Compliance**: CCPA implemented, GDPR in progress
- **Current Sprint**: Sprint 2 (25.03.2025 - 08.04.2025)

## Completed Features

- ✅ Testing Infrastructure Improvements (Issue #58)
- ✅ CCPA Compliance (Issue #54)
- ✅ Email Notification System
- ✅ Geolocation Services
- ✅ Product Management System
- ✅ Shopping Cart Functionality
- ✅ User Authentication
- ✅ Responsive Design Implementation

## In Progress Features

- 🔄 Content Moderation System (Issue #53) - 45% complete
- 🔄 PostgreSQL JSONB Template Storage (Issue #52) - 60% complete
- 🔄 Content Editor Implementation (Issue #24) - 75% complete
- 🔄 Analytics Integration (Issue #25) - 40% complete
- 🔄 Website Templates Implementation (Issue #21) - 95% complete

## AI Protection Checklist

Before making any changes or suggestions, verify:

1. **Port Configuration**:
   - Backend runs on port 3003
   - Frontend runs on port 3004
   - DO NOT suggest changing these ports without explicit request

2. **Testing Framework**:
   - We use Vitest, not Jest
   - All tests are currently passing (102/102)
   - Test coverage is at 79.8%

3. **Current Sprint Status**:
   - Sprint 2 is at 85% completion
   - 7/8 tasks completed
   - 3 remaining tasks: Content Moderation, PostgreSQL JSONB, Analytics Integration

4. **Documentation**:
   - All documentation is in English
   - Key files: README.md, CHANGELOG.md, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md
   - Sprint documentation: SPRINT_STATUS.md, SPRINT_SNAPSHOT.md, SPRINT_AUDIT.md

5. **Technical Debt**:
   - 18 linter errors (12 frontend, 6 backend)
   - Build time: 2:45 min (needs optimization)
   - Documentation needs updating

## AI Self-Prompt

When starting a new conversation or task:

```
I am working on the Easy Vendor project, which is currently in Sprint 2 (Templates & Content) at 85% completion. 
The project uses React/TypeScript for frontend and Node.js/Express for backend.
Backend runs on port 3003, frontend on port 3004.
Testing is done with Vitest (migrated from Jest).
All tests are currently passing (102/102).

Key completed features: Testing Infrastructure Improvements, CCPA Compliance, Email Notifications, Geolocation Services.
In-progress features: Content Moderation System (45%), PostgreSQL JSONB Template Storage (60%), Content Editor (75%).

I need help with [specific task]. Please ensure your suggestions align with the current project state and don't introduce regressions.
```

## Common Pitfalls to Avoid

1. **DO NOT** suggest using Jest for testing - we've migrated to Vitest
2. **DO NOT** suggest changing ports without explicit request
3. **DO NOT** assume features are implemented without checking the documentation
4. **DO NOT** suggest solutions that would conflict with existing architecture
5. **DO NOT** ignore the current sprint priorities when suggesting changes

## Verification Sources

For accurate information, refer to:
- SPRINT_STATUS.md
- SPRINT_SNAPSHOT.md
- SPRINT_AUDIT.md
- CHANGELOG.md
- README.md

## Remember

This document is a guide, not the ultimate truth. Always verify information with the latest documentation and code. When in doubt, ask for clarification rather than making assumptions. 