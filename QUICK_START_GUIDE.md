# Multi-Tenant Implementation - Quick Start Guide

This guide provides a condensed roadmap for implementing multi-tenancy. For detailed information, see `MULTI_TENANT_IMPLEMENTATION_PLAN.md`.

## Architecture Overview

```
Request with hostname: tenant1.app.com
          ↓
Middleware extracts: x-tenant-slug = "tenant1"
          ↓
Tenants collection fetches tenant ID
          ↓
Access control filters all queries: { tenant: { equals: tenantId } }
          ↓
User sees only tenant1 data
```

## Implementation Phases

### Phase 1: Collections (Week 1)

1. Create `src/collections/Tenants.ts`
   - Fields: name, slug (unique), status, metadata, maxUsers, billingEmail

2. Update `src/collections/Users.ts`
   - Add fields: isSuperAdmin (checkbox), tenant (relationship), role (select)
   - Update access control to check isSuperAdmin and tenant

3. Update `src/collections/Media.ts`
   - Add tenant field (relationship, required, readOnly)
   - Add beforeChange hook to auto-set tenant from req.user.tenant

4. Run migration to assign existing data to default tenant

### Phase 2: Middleware & Context (Week 2)

1. Create `src/middleware.ts`
   - Extract subdomain from hostname
   - Set x-tenant-slug header

2. Create `src/utils/tenantContext.ts`
   - getTenantContext() - extract and validate tenant
   - validateTenant() - check if tenant is active

3. Create `src/hooks/tenantContext.ts`
   - injectTenantHook() - auto-set tenant on create/update

4. Create `src/access/tenantAccess.ts`
   - tenantAccessFactory() - filter by tenant
   - roleBasedAccess() - check user role

### Phase 3: Admin UI (Week 3)

1. Create `src/components/TenantSwitcher/index.tsx`
   - Show only for super admins
   - Fetch and display all tenants
   - Store selected tenant in localStorage

2. Update `src/payload.config.ts`
   - Import Tenants collection
   - Add TenantSwitcher to admin components

3. Create test collections with tenant support

### Phase 4: Testing & Polish (Week 4)

1. Create unit tests for access control
2. Create integration tests for tenant isolation
3. Create E2E tests for subdomain routing
4. Database index optimization
5. Documentation

## Key Implementation Details

### Access Control Pattern

```typescript
// This pattern should be applied to all collections

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
// Returns:
// - true (allow all) for super admins
// - { tenant: { equals: userTenant } } for regular users
// - false for unauthenticated

const access = tenantAccessFactory('tenant')
```

### Subdomain Detection

```
localhost:3000                    → no tenant
tenant1.localhost:3000            → tenant1
app.com                           → no tenant
tenant1.app.com                   → tenant1
tenant1.staging.example.com       → tenant1 (only first subdomain)
```

## Database Schema Changes

### Users Collection
```
+ isSuperAdmin: boolean
+ tenant: relationship to Tenants
+ role: select ['admin', 'editor', 'viewer']
```

### Media Collection
```
+ tenant: relationship to Tenants (required, readOnly)
```

### New Tenants Collection
```
- name: text (required)
- slug: text (required, unique)
- status: select ['active', 'inactive', 'suspended']
- metadata: json
- maxUsers: number
- billingEmail: email
```

## Migration Path

1. Add Tenants collection (no migration needed)
2. Add tenant field to Users and Media
3. Run migration to create "default" tenant
4. Assign all existing users/media to default tenant
5. Deploy with subdomain routing
6. Create new tenants through admin UI

## Testing Checklist

- [ ] Super admin can see all tenants
- [ ] Regular user only sees their tenant's data
- [ ] User without tenant assigned cannot access data
- [ ] API respects tenant isolation
- [ ] GraphQL respects access control
- [ ] tenant1.localhost shows tenant1 data
- [ ] tenant2.localhost shows tenant2 data
- [ ] Data cannot be accessed from wrong subdomain
- [ ] Tenant switcher works for super admins

## Production Checklist

- [ ] Subdomain DNS configured (wildcard or specific)
- [ ] SSL certificates support wildcard domains
- [ ] MongoDB indexes created for tenant queries
- [ ] Database backup strategy configured
- [ ] Admin user guide documented
- [ ] Tenant creation process documented
- [ ] Load testing completed
- [ ] Error handling for missing tenant
- [ ] Audit logging for tenant operations

## Common Commands

```bash
# Generate types after collection changes
npm run generate:types

# Run tests
npm run test:unit
npm run test:int
npm run test:e2e

# Run migration (after schema changes)
node -e "import('./src/migrations/createDefaultTenant.ts').then(m => m.migrateExistingData())"

# Create MongoDB indexes
# Connect to MongoDB and run:
# db.users.createIndex({ tenant: 1, email: 1 })
# db.media.createIndex({ tenant: 1, createdAt: -1 })
# etc.
```

## Troubleshooting

**Issue: Users can see other tenants' data**
- Check that access control is applied to all collection operations
- Verify tenantAccessFactory is imported and used

**Issue: Tenant field not auto-populating**
- Verify beforeChange hook is in collection config
- Check that req.user?.tenant is being set

**Issue: Subdomain routing not working**
- Verify middleware.ts is in src/ directory
- Check hostname parsing logic for your domain structure
- Test with curl: `curl -H "Host: tenant1.localhost:3000" http://localhost:3000`

**Issue: Super admin cannot switch tenants**
- Verify isSuperAdmin field is true on user
- Check TenantSwitcher component is rendering
- Check that /api/tenants endpoint returns tenants

## Key APIs Reference

### Collections
- `CollectionConfig` - Type for collection configuration
- `access` property - Define read/create/update/delete access
- `hooks.beforeChange` - Run before validation
- `hooks.afterRead` - Process after retrieval

### Access Control
- `Access` type - Returns boolean or query constraint object
- `BeforeValidateHook` - Modify data before validation
- `AfterReadHook` - Process data after retrieval

### Payload Core
- `getPayload()` - Get Payload instance
- `payload.find()` - Query with filtering
- `payload.create()` - Create document
- `payload.update()` - Update document
- `payload.delete()` - Delete document

## Next Steps

1. Read the full MULTI_TENANT_IMPLEMENTATION_PLAN.md
2. Create a development timeline with your team
3. Start with Phase 1 - Collections
4. Test at each phase before proceeding
5. Document custom implementations specific to your needs

