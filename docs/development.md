# Development Guide

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- pnpm (recommended) or npm

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Trokir/easy-vendor.git
cd easy-vendor
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Start development servers:

```bash
# Frontend
pnpm dev:frontend

# Backend
pnpm dev:backend
```

### Database Setup

1. Create PostgreSQL database:

```bash
createdb easy_vendor_dev
```

2. Run migrations:

```bash
pnpm db:migrate
```

3. Seed development data:

```bash
pnpm db:seed
```

## Project Structure

```
easy-vendor/
├── apps/
│   ├── frontend/          # Next.js frontend
│   └── backend/           # NestJS backend
├── packages/              # Shared packages
├── docs/                  # Documentation
└── scripts/              # Development scripts
```

## Development Workflow

### Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `release/*` - Release branches

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

### Pull Requests

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote
4. Create PR to `develop`
5. Get review and merge

## Testing

### Unit Tests

```bash
# Frontend
pnpm test:frontend

# Backend
pnpm test:backend
```

### E2E Tests

```bash
pnpm test:e2e
```

### Test Coverage

```bash
pnpm test:coverage
```

## Code Style

### Frontend

- ESLint + Prettier
- TypeScript strict mode
- React best practices
- Tailwind CSS guidelines

### Backend

- NestJS style guide
- TypeScript strict mode
- SOLID principles
- Clean architecture

## Documentation

### API Documentation

- Swagger UI at `/api/docs`
- OpenAPI spec in `/docs/api/openapi.yaml`

### Component Documentation

- Storybook for frontend components
- JSDoc for backend services

## Deployment

### Staging

- Automatic deployment to staging
- Railway.app platform
- PostgreSQL + Redis

### Production

- Manual deployment approval
- Blue-green deployment
- Database migrations

## Monitoring

### Logs

- Application logs in Railway
- Error tracking in Sentry
- Audit logs in PostgreSQL

### Metrics

- Response times
- Error rates
- Active users
- Resource usage

## Troubleshooting

### Common Issues

1. Database connection
2. Redis connection
3. Environment variables
4. Build failures

### Debug Tools

- Chrome DevTools
- VS Code debugger
- pgAdmin
- Redis CLI
