# Custom Domain Implementation Design Doc

## Overview
Enable tenants to connect their own domains (e.g., `shop.mybrand.com` or `www.mybrand.com`) to their store running on our Multi-tenant SaaS (e.g., `my-saas.com`).

## 1. Architecture

### Request Flow
1.  **Browser Request**: User visits `shop.mybrand.com`.
2.  **DNS Resolution**: `shop.mybrand.com` (CNAME) -> `gateway.my-saas.com` (Your Server IP).
3.  **Reverse Proxy (Caddy/Nginx)**: Handles SSL termination.
    *   *Critical Step*: Must dynamically load certificates for `shop.mybrand.com`.
4.  **Application Server (Next.js/NestJS)**:
    *   Receives request with `Host: shop.mybrand.com`.
    *   **Middleware**: Looks up Tenant by `customDomain`.
    *   **Routing**: Rewrites URL to serve the correct tenant content.

## 2. Database Schema Changes

Modify **`TenantEntity`** (and corresponding DTOs/Schemas):

```typescript
@Entity('tenants')
export class TenantEntity {
    // ... existing fields

    @Column({ nullable: true, unique: true })
    customDomain: string; // e.g., "shop.mybrand.com"

    @Column({ 
        type: 'enum', 
        enum: ['PENDING', 'VERIFIED', 'ACTIVE', 'FAILED'],
        default: 'PENDING' 
    })
    domainStatus: string;

    @Column({ nullable: true })
    domainVerificationCode: string; // e.g., "poly-verify=ae83-29fd"

    @Column({ default: false })
    sslEnabled: boolean;
}
```

## 3. Implementation Phases

### Phase 1: Domain Management (CRUD)
**API Endpoints:**
- `POST /api/tenants/domain`: User submits a domain.
    - Action: Save to DB, generate `domainVerificationCode`, set status `PENDING`.
- `GET /api/tenants/domain`: Get current status and instructions.
- `DELETE /api/tenants/domain`: Remove association.

**Frontend UI:**
- Input field for domain.
- **Instructions Box**:
    > Log in to your DNS provider and add:
    > - **Type**: CNAME | **Host**: (subdomain) | **Value**: gateway.my-saas.com
    > - **Type**: TXT | **Host**: @ | **Value**: poly-verify=ae83-29fd
- "Verify" Button.

### Phase 2: Verification Logic (Backend)
Endpoint: `POST /api/tenants/domain/verify`

**Logic (Node.js):**
```typescript
import { resolveTxt, resolveCname } from 'dns/promises';

async function verifyDomain(domain: string, expectedCode: string) {
  try {
    // 1. Check ownership (TXT record)
    const txtRecords = await resolveTxt(domain); // or the root domain
    const hasCode = txtRecords.flat().includes(expectedCode);

    if (!hasCode) throw new Error("TXT record not found");

    // 2. Check pointing (CNAME/A record)
    // Optional but good for UX: ensure it actually points to us before activating
    return true;
  } catch (err) {
    return false;
  }
}
```

### Phase 3: The Proxy & SSL (Infrastructure)

#### Option A: Caddy Server (Recommended 🌟)
Caddy automatically manages SSL certificates on-demand.

**Caddyfile Config:**
```caddyfile
:443 {
    tls {
        on_demand
    }
    reverse_proxy localhost:3000
}
```
*Note: You need to configure Caddy to ask your API "Is this domain allowed?" to prevent abuse.*

#### Option B: Nginx + Lua/Certbot (Complex)
Requires writing Lua scripts in OpenResty to dynamically handshake SSL, or running a cron job that runs `certbot` for every new verifying domain. **Not recommended for MVP.**

### Phase 4: Application Routing (Next.js Middleware)
**`middleware.ts`**:
```typescript
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const hostname = req.headers.get('host'); // e.g. shop.coolbrand.com
  const isCustomDomain = !hostname.includes('my-saas.com');

  if (isCustomDomain) {
    // 1. Fetch tenant via internal API or cache
    // const tenant = await getTenantByDomain(hostname);
    
    // 2. Rewrite path
    // return NextResponse.rewrite(new URL(`/tenants/${tenant.slug}${req.nextUrl.pathname}`, req.url));
    
    // For now, mapping to existing dynamic page route:
    return NextResponse.rewrite(new URL(`/${hostname}${req.nextUrl.pathname}`, req.url));
  }
}
```
*Note: You likely need to adjust your app structure to handle dynamic updates based on host.*

## 4. Security Considerations
1.  **Domain Takeover**: Verify ownership (TXT record) *before* allowing the domain to route traffic.
2.  **Rate Limiting**: Limit how many times a user can hit "Verify".
3.  **DDoS**: Use Cloudflare or similar in front of your Caddy server if possible.

## 5. Summary Checklist
- [ ] Add `customDomain` fields to DB.
- [ ] Build "Add Domain" UI + DNS Instructions.
- [ ] Implement Node.js DNS verification logic.
- [ ] Set up Caddy (or similar) for handling incoming traffic on port 80/443.
- [ ] Update Next.js Middleware to route `Custom Domain` -> `Tenant Store`.
