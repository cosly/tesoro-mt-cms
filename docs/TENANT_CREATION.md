# Tenant Creation Guide

## Current: Super-Admin Only

Tenants can only be created by users with `isSuperAdmin: true`.

### Via Admin Panel
1. Login as super-admin
2. Navigate to `/admin/collections/tenants`
3. Click "Create New"
4. Fill in tenant details:
   - Name
   - Domain (subdomain, e.g., "tenant1")
   - Status (active/inactive/suspended)
   - Settings (theme, maxUsers, maxStorage)

### Via REST API

```bash
POST /api/tenants
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "name": "My Company",
  "domain": "mycompany",
  "status": "active",
  "settings": {
    "theme": "default",
    "maxUsers": 10,
    "maxStorage": 1024
  },
  "metadata": {
    "contactEmail": "admin@mycompany.com",
    "contactName": "John Doe"
  }
}
```

### Via GraphQL

```graphql
mutation CreateTenant {
  createTenant(
    data: {
      name: "My Company"
      domain: "mycompany"
      status: active
      settings: {
        theme: default
        maxUsers: 10
        maxStorage: 1024
      }
      metadata: {
        contactEmail: "admin@mycompany.com"
        contactName: "John Doe"
      }
    }
  ) {
    id
    name
    domain
    status
  }
}
```

## Future: Public API for Tenant Registration

To enable self-service tenant registration, create a custom endpoint:

### Option 1: Next.js API Route

Create `src/app/api/register-tenant/route.ts`:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: await config })
  const body = await req.json()

  // Validate input
  const { companyName, domain, email, firstName, lastName } = body

  // Create tenant
  const tenant = await payload.create({
    collection: 'tenants',
    data: {
      name: companyName,
      domain: domain.toLowerCase(),
      status: 'active',
      settings: {
        theme: 'default',
        maxUsers: 10,
        maxStorage: 1024,
      },
      metadata: {
        contactEmail: email,
        contactName: `${firstName} ${lastName}`,
      },
    },
    // Bypass access control for public registration
    overrideAccess: true,
  })

  // Create first admin user for this tenant
  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password: 'changeme', // Send password reset email
      tenant: tenant.id,
      role: 'admin',
      firstName,
      lastName,
    },
    overrideAccess: true,
  })

  // TODO: Send welcome email with password reset link

  return NextResponse.json({
    success: true,
    tenantId: tenant.id,
    userId: user.id,
    domain: tenant.domain,
  })
}
```

### Option 2: Payload Custom Endpoint

Add to `payload.config.ts`:

```typescript
endpoints: [
  {
    path: '/register-tenant',
    method: 'post',
    handler: async (req, res) => {
      const { companyName, domain, email, firstName, lastName } = req.body

      // Create tenant and admin user
      // ... (same logic as above)

      res.json({ success: true, tenantId: tenant.id })
    },
  },
]
```

### Security Considerations

When implementing public tenant registration:

1. **Rate Limiting**: Prevent abuse
2. **Email Verification**: Verify email before activation
3. **Domain Validation**: Check domain availability
4. **Captcha**: Prevent bot signups
5. **Approval Workflow**: Optionally require manual approval
6. **Payment Integration**: Integrate billing if needed

### Example with Email Verification

```typescript
// 1. Create tenant with status: 'inactive'
const tenant = await payload.create({
  collection: 'tenants',
  data: {
    name: companyName,
    domain,
    status: 'inactive', // Inactive until email verified
    // ...
  },
  overrideAccess: true,
})

// 2. Create verification token
const verificationToken = generateToken()
await payload.create({
  collection: 'verification-tokens',
  data: {
    tenant: tenant.id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  },
})

// 3. Send verification email
await sendVerificationEmail(email, verificationToken)

// 4. On email verification:
// - Set tenant status to 'active'
// - Create admin user
// - Send welcome email
```
