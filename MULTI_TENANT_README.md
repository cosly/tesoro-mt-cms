# Multi-Tenant Implementation for Payload CMS 3.x

This directory contains comprehensive documentation and implementation guidance for adding multi-tenant functionality to a Payload CMS 3.x application.

## What is Multi-Tenancy?

Multi-tenancy is an architecture where a single application instance serves multiple independent customers (tenants), each with their own isolated data. This plan implements:

- **Shared Database** - All tenant data in one MongoDB instance
- **Tenant Field Isolation** - Every collection has a `tenant` field for filtering
- **Subdomain Routing** - `tenant1.app.com`, `tenant2.app.com`
- **Super Admin Control** - One admin can manage multiple tenants
- **Regular User Isolation** - Users only see their tenant's data

## Quick Navigation

### For Quick Reference
Start here:
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - 4-week implementation roadmap with key patterns

### For Complete Understanding
Read this for details:
- **[MULTI_TENANT_IMPLEMENTATION_PLAN.md](MULTI_TENANT_IMPLEMENTATION_PLAN.md)** - 10-phase detailed plan with full code examples

### For API Reference
Keep this handy:
- **[API_REFERENCE.md](API_REFERENCE.md)** - Payload 3.x and Next.js APIs with examples

### For Implementation Tracking
Use this checklist:
- **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Week-by-week tasks and deployment checklist

## Architecture Overview

```
User visits: tenant1.app.com
        ↓
Next.js Middleware
  - Extracts subdomain
  - Sets x-tenant-slug header
        ↓
Payload Collection
  - Access control checks tenant
  - Super admin sees all
  - Regular user sees only tenant1
        ↓
MongoDB Query
  - Automatically filters: { tenant: tenant1Id }
        ↓
Admin UI
  - Super admin sees tenant switcher
  - Can switch between all tenants
  - Regular user sees only their data
```

## Key Features

### 1. Tenants Collection
Manages all tenant metadata:
- Name and slug (subdomain identifier)
- Status (active/inactive/suspended)
- Metadata (logo, contact info, etc.)
- User quota per tenant

### 2. Access Control
```typescript
// Super admins see all tenants
if (user.isSuperAdmin) return true

// Regular users see only their tenant
return { tenant: { equals: user.tenant } }
```

### 3. Automatic Tenant Assignment
Documents automatically assigned to user's tenant via hooks:
```typescript
hooks: {
  beforeChange: [
    async ({ data, req }) => {
      if (!data.tenant) {
        data.tenant = req.user?.tenant
      }
      return data
    }
  ]
}
```

### 4. Subdomain Detection
Middleware extracts tenant from hostname:
- `localhost:3000` → no tenant
- `tenant1.localhost:3000` → tenant1
- `tenant1.app.com` → tenant1

### 5. Admin UI Tenant Switcher
Super admins can:
- See dropdown with all tenants
- Switch between tenants instantly
- Manage each tenant's data separately

## Implementation Phases

### Phase 1: Collections (Week 1)
- Create Tenants collection
- Update Users with tenant field + roles
- Update Media with tenant field
- Run migration for existing data

### Phase 2: Middleware & Context (Week 2)
- Create middleware for subdomain detection
- Create utilities for tenant context
- Create access control helpers
- Update Payload hooks

### Phase 3: Admin UI (Week 3)
- Build tenant switcher component
- Integrate into admin layout
- Create example tenant-aware collection
- Test in admin interface

### Phase 4: Testing & Production (Week 4)
- Write comprehensive tests
- Create database indexes
- Deploy to production
- Monitor and optimize

## Database Schema Changes

### Users Collection
```typescript
// Add fields:
isSuperAdmin: boolean          // Can manage all tenants
tenant: relationship           // Assigned tenant
role: select                   // admin | editor | viewer
```

### Media Collection
```typescript
// Add field:
tenant: relationship (required, readOnly)
```

### New Tenants Collection
```typescript
name: text (required)
slug: text (required, unique)
status: select
metadata: json
maxUsers: number
billingEmail: email
```

## Code Examples

### Adding a Tenant-Aware Collection

```typescript
import type { CollectionConfig } from 'payload'
import { tenantAccessFactory } from '@/access/tenantAccess'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  access: {
    read: tenantAccessFactory('tenant'),
    create: tenantAccessFactory('tenant'),
    update: tenantAccessFactory('tenant'),
    delete: tenantAccessFactory('tenant'),
  },
  fields: [
    // ... your fields ...
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
  },
}
```

### Access Control Factory

```typescript
// In src/access/tenantAccess.ts
export const tenantAccessFactory = (field: string = 'tenant'): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined

    if (!user) return false                          // Not authenticated
    if (user.isSuperAdmin) return true              // Super admin sees all
    if (user.tenant) {
      return { [field]: { equals: user.tenant } }   // Filter by tenant
    }
    return false                                     // No tenant, deny
  }
```

### Querying Tenant Data

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Access control automatically filters by tenant
const result = await payload.find({
  collection: 'media',
  where: {
    status: { equals: 'active' }
  }
})
// If user is regular: filtered to their tenant
// If user is super admin: sees all tenants
```

## File Structure

```
src/
├── collections/
│   ├── Users.ts           (updated with tenant support)
│   ├── Media.ts           (updated with tenant support)
│   └── Tenants.ts         (new - tenant management)
├── middleware.ts          (new - subdomain detection)
├── access/
│   └── tenantAccess.ts   (new - access control helpers)
├── utils/
│   └── tenantContext.ts  (new - tenant utilities)
├── hooks/
│   └── tenantContext.ts  (new - Payload hooks)
├── components/
│   └── TenantSwitcher/   (new - admin UI component)
├── migrations/
│   ├── createDefaultTenant.ts      (new - data migration)
│   └── createTenantIndexes.ts      (new - db indexes)
└── app/
    └── (payload)/
        └── api/
            └── tenants/
                └── route.ts        (new - API endpoint)

tests/
├── unit/
│   └── access.test.ts              (new - unit tests)
├── int/
│   └── multitenancy.int.spec.ts   (new - integration tests)
└── e2e/
    └── multitenancy.e2e.spec.ts   (new - e2e tests)
```

## Getting Started

### Step 1: Read the Documentation
1. Start with [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
2. Review [MULTI_TENANT_IMPLEMENTATION_PLAN.md](MULTI_TENANT_IMPLEMENTATION_PLAN.md)
3. Keep [API_REFERENCE.md](API_REFERENCE.md) handy
4. Use [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) to track progress

### Step 2: Setup Development Environment
```bash
# Ensure dependencies are installed
npm install

# Verify existing setup works
npm run dev

# Check Node version (18+ required)
node --version
```

### Step 3: Begin Implementation
Follow the 4-week timeline in IMPLEMENTATION_CHECKLIST.md:
- Week 1: Collections & Migration
- Week 2: Middleware & Context
- Week 3: Admin UI & Components
- Week 4: Testing & Production

### Step 4: Test Locally
```bash
# Generate types after collection changes
npm run generate:types

# Run tests
npm run test

# Test subdomain routing
curl -H "Host: tenant1.localhost:3000" http://localhost:3000/api/media
```

## Testing Strategy

### Unit Tests
Test access control functions in isolation

### Integration Tests
Test with real database, verify isolation

### E2E Tests
Test through browser, verify subdomain routing

### Load Testing
Verify performance with multiple tenants

See [MULTI_TENANT_IMPLEMENTATION_PLAN.md](MULTI_TENANT_IMPLEMENTATION_PLAN.md) Phase 7 for complete test examples.

## Deployment

### Pre-Deployment Checklist
- All tests passing
- Database indexes created
- DNS/subdomains configured
- SSL certificates support wildcards
- Migration tested on staging

### Deployment Steps
1. Deploy code
2. Run migration
3. Verify data isolation
4. Monitor logs
5. Test all tenants

See [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) for complete deployment checklist.

## Key Concepts

### Tenant Field
Every document has a `tenant` field linking to the Tenants collection. This is the foundation of isolation.

### Access Control
Returns `true` (allow all) for super admins, `{ tenant: { equals: userId } }` for regular users. Payload automatically enforces this.

### Hooks
Auto-set tenant before saving, validate constraints, log changes. Essential for ensuring consistency.

### Middleware
Extract subdomain before request reaches API. Pass via header to downstream code.

### Database Indexes
Create indexes on `tenant` combined with common query fields. Critical for performance.

## Common Patterns

### Pattern: Super Admin + Tenant Filter
```typescript
access: {
  read: async ({ req }) => {
    if (req.user?.isSuperAdmin) return true
    return { tenant: { equals: req.user?.tenant } }
  }
}
```

### Pattern: Role-Based + Tenant Filter
```typescript
access: {
  create: async ({ req }) => {
    if (!req.user) return false
    if (req.user.isSuperAdmin) return true
    const allowed = ['admin', 'editor']
    return allowed.includes(req.user.role as string)
  }
}
```

### Pattern: Auto-Set Tenant
```typescript
hooks: {
  beforeChange: [
    async ({ data, req }) => {
      if (!data.tenant && req.user?.tenant) {
        data.tenant = req.user.tenant
      }
      return data
    }
  ]
}
```

## Troubleshooting

### Issue: Users can see other tenants' data
**Solution**: Verify access control is applied to all collections and uses `tenantAccessFactory`.

### Issue: Tenant field not auto-populating
**Solution**: Check `beforeChange` hook exists and `req.user?.tenant` is set by middleware.

### Issue: Subdomain routing not working
**Solution**: Verify middleware.ts in src/, check hostname parsing, test with curl.

### Issue: Super admin cannot switch tenants
**Solution**: Verify `isSuperAdmin=true` on user, check TenantSwitcher renders, test /api/tenants endpoint.

See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) Troubleshooting section for more.

## Performance Tips

1. **Create database indexes** on `tenant` field
2. **Cache tenant metadata** in Redis
3. **Use `select`** to fetch only needed fields
4. **Paginate** large result sets
5. **Monitor** slow query log

See [MULTI_TENANT_IMPLEMENTATION_PLAN.md](MULTI_TENANT_IMPLEMENTATION_PLAN.md) Phase 10 for detailed optimization.

## Security Considerations

1. **Always validate tenant** in access control
2. **Never trust** client-provided tenant ID
3. **Enforce HTTPS** for all subdomains
4. **Implement rate limiting** on auth endpoints
5. **Audit log** all tenant operations

See [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) Security section for details.

## API Reference

All Payload CMS 3.x and Next.js APIs used in this plan are documented in [API_REFERENCE.md](API_REFERENCE.md) with:
- CollectionConfig interface
- Field types
- Hook signatures
- Access control patterns
- Query operators
- Code examples

## Technologies Used

- **Payload CMS** 3.62.0 - Headless CMS
- **Next.js** 15.4.4 - React framework
- **MongoDB** 4.4+ - Database
- **TypeScript** 5.7.3 - Type safety
- **Vitest** 3.2.3 - Testing
- **Playwright** 1.54.1 - E2E testing

## License

This implementation plan is provided as-is for use with Payload CMS projects.

## Support

For implementation help:
1. Check the [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) Common Questions section
2. Review Payload CMS documentation: https://payloadcms.com/docs
3. Check Next.js documentation: https://nextjs.org/docs
4. Review MongoDB documentation: https://docs.mongodb.com

## Document Index

| Document | Purpose | Length | When to Use |
|----------|---------|--------|------------|
| [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) | Quick reference | 200 lines | Daily development |
| [MULTI_TENANT_IMPLEMENTATION_PLAN.md](MULTI_TENANT_IMPLEMENTATION_PLAN.md) | Complete guide | 400+ lines | Understanding architecture |
| [API_REFERENCE.md](API_REFERENCE.md) | API reference | 300+ lines | Implementation |
| [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) | Tracking & deployment | 200+ lines | Project management |

---

**Created**: 2025-11-01  
**Payload CMS Version**: 3.62.0  
**Next.js Version**: 15.4.4  
**Status**: Ready for implementation

Start with [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
