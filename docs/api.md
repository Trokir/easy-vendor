# API Documentation

## Overview

The Easy Vendor API is built with NestJS and follows RESTful principles. All endpoints require authentication except for public routes.

## Base URL

```
https://api.easyvendor.com/v1
```

## Authentication

### JWT Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Refresh Token

To refresh an expired token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

## Endpoints

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "businessName": "My Business",
  "templateType": "it_consulting",
  "acceptedTerms": true
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Vendors

#### Get Vendor Profile

```http
GET /vendors/me
Authorization: Bearer <token>
```

#### Update Vendor Profile

```http
PATCH /vendors/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "Updated Business Name",
  "config": {
    "theme": "dark",
    "contactEmail": "contact@example.com"
  }
}
```

### Templates

#### List Available Templates

```http
GET /templates
Authorization: Bearer <token>
```

#### Get Template Details

```http
GET /templates/:id
Authorization: Bearer <token>
```

### Domains

#### Check Domain Availability

```http
GET /domains/check?domain=example.com
Authorization: Bearer <token>
```

#### Add Custom Domain

```http
POST /domains
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "example.com",
  "ssl": true
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user
- Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1612345678
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded"
}
```

## Webhooks

### Available Events

- `vendor.created`
- `vendor.updated`
- `domain.added`
- `domain.verified`
- `template.published`

### Webhook Payload

```json
{
  "event": "vendor.created",
  "timestamp": "2024-03-31T12:00:00Z",
  "data": {
    "vendorId": "123",
    "businessName": "Example Business",
    "email": "user@example.com"
  }
}
```

### Security

- Webhook signatures using HMAC SHA-256
- Signature header: `X-Webhook-Signature`
- Retry policy: 3 attempts with exponential backoff

## SDK Examples

### JavaScript/TypeScript

```typescript
import { EasyVendor } from '@easyvendor/sdk';

const client = new EasyVendor({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.easyvendor.com/v1',
});

// Register a new vendor
const vendor = await client.vendors.register({
  email: 'user@example.com',
  password: 'secure_password',
  businessName: 'My Business',
  templateType: 'it_consulting',
});

// Update vendor profile
await client.vendors.update({
  businessName: 'Updated Name',
  config: {
    theme: 'dark',
  },
});
```

### Python

```python
from easyvendor import EasyVendor

client = EasyVendor(
    api_key='your_api_key',
    base_url='https://api.easyvendor.com/v1'
)

# Register a new vendor
vendor = client.vendors.register(
    email='user@example.com',
    password='secure_password',
    business_name='My Business',
    template_type='it_consulting'
)

# Update vendor profile
client.vendors.update(
    business_name='Updated Name',
    config={'theme': 'dark'}
)
```
