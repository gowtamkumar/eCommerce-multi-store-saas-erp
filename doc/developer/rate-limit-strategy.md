# Rate Limiting Strategy (Developer Documentation)

This document outlines how rate limiting is implemented in the eCommerce Multi-Tenant SaaS backend to protect against abuse, brute force, and accidental double-submissions.

## Core Infrastructure

We use **`@nestjs/throttler`** for granular control and **Redis** for distributed state management. This ensures that rate limits are consistently applied even if the application is running in multiple containers/instances.

### Key Components

- **Module**: `AppThrottlerModule` (Found in `src/common/throttler/throttler.module.ts`)
- **Storage**: `@nest-lab/throttler-storage-redis`
- **Guard**: `CustomThrottlerGuard` (Located in `src/common/throttler/throttler.guard.ts`)

## Global Configuration

The following named strategies are defined in `app.module.ts`:

| Strategy Name | TTL (Seconds) | Limit (Requests) | Typical Use Case |
| :--- | :--- | :--- | :--- |
| **`standard`** | 60 | 100 | General API browsing, looking up products. |
| **`sensitive`** | 60 | 5 | Login, Registration, OTP, Forgot Password. |
| **`transactional`** | 60 | 10 | Creating Orders, Initiating Payments. |
| **`promo`** | 60 | 15 | Validating/Applying Coupon codes. |

## Multi-Tenant Awareness

To ensure that one tenant's traffic doesn't count against another tenant's limit, we use a `CustomThrottlerGuard`.

The tracking key in Redis is generated using:
`tenantId : userId : ip`

- **`tenantId`**: Populated by the `TenantContextMiddleware`.
- **`userId`**: Taken from the JWT (if authenticated).
- **`ip`**: The requester's IP address.

This means a single IP can make 5 login attempts *per store*.

## How to Apply Rate Limiting

### 1. Applying to a Controller
To apply a limit to **all** methods in a controller, add the `@Throttle()` decorator to the class:

```typescript
@Throttle({ standard: { limit: 50, ttl: 60000 } })
@Controller('products')
export class ProductController {}
```

### 2. Applying to a Specific Method (Recommended)
This is the most common use case for sensitive endpoints:

```typescript
@Throttle({ sensitive: { limit: 5, ttl: 60000 } })
@Post('/login')
async login() { ... }
```

### 3. Bypassing Rate Limits
If you need to skip rate limiting for a specific endpoint (e.g., system webhooks), use the `@SkipThrottle()` decorator:

```typescript
@SkipThrottle()
@Post('/webhook')
async handleWebhook() { ... }
```

## Troubleshooting & Verification

- **Headers**: Check for `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` in the response headers.
- **Errors**: When a limit is hit, the API returns a `429 Too Many Requests` status code.
- **Redis Connection**: Ensure the Redis server is reachable via `REDIS_HOST` and `REDIS_PORT` in your `.env` file.
