# Architecture Overview

## System Architecture

```mermaid
graph TD
    Client[Client Browser] --> Frontend[Next.js Frontend]
    Frontend --> Backend[NestJS Backend]
    Backend --> DB[(PostgreSQL)]
    Backend --> Redis[(Redis Cache)]
    Backend --> Cloudflare[Cloudflare]
    Cloudflare --> Client
```

## Components

### Frontend (Next.js)

- **Framework**: Next.js 14+ with App Router
- **State Management**: React Context + Zustand
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **API Client**: TanStack Query

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Authentication**: JWT + Refresh Tokens
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer
- **Rate Limiting**: Redis-based

### Database (PostgreSQL)

#### Core Tables

```sql
-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    template_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Consents
CREATE TABLE legal_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_type VARCHAR(20) NOT NULL,
    ip VARCHAR(45),
    accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Indexes

```sql
-- Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vendors_domain ON vendors(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_vendors_user_id ON vendors(user_id);

-- Audit Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Infrastructure

- **Hosting**: Railway.app
- **CDN**: Cloudflare
- **Analytics**: GoatCounter
- **Email**: SendGrid
- **File Storage**: Cloudflare R2

## Security

### Authentication Flow

1. User submits credentials
2. Backend validates and returns JWT + Refresh Token
3. Frontend stores tokens in HTTP-only cookies
4. Refresh token rotation on expiry

### Rate Limiting

- Redis-based rate limiting
- Fallback to PostgreSQL if Redis unavailable
- Limits per IP and per user

### Data Protection

- All passwords hashed with bcrypt
- Sensitive data encrypted at rest
- Regular backups to secure storage
- CCPA compliance measures

## Monitoring

### Logging

- Application logs to Railway
- Error tracking with Sentry
- Audit logs in PostgreSQL
- Request logs for rate limiting

### Metrics

- Response times
- Error rates
- Active users
- Template usage statistics

## Deployment

### CI/CD Pipeline

1. GitHub Actions for testing
2. Railway.app for deployment
3. Automated database migrations
4. Environment-specific configurations

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Email
SENDGRID_API_KEY=your-key

# Cloudflare
CLOUDFLARE_API_TOKEN=your-token
```

## Future Considerations

### Scalability

- Read replicas for PostgreSQL
- Redis cluster for caching
- CDN edge functions
- Horizontal scaling of API servers

### Features

- Multi-language support
- Advanced analytics
- Custom CSS editor
- API access for vendors
- Webhook support 