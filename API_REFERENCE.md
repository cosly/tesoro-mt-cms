# Multi-Tenant API Reference

Complete reference for Payload 3.x APIs used in multi-tenant implementation.

## Collection Configuration

### CollectionConfig

```typescript
import type { CollectionConfig } from 'payload'

interface CollectionConfig {
  slug: string
  labels?: {
    singular?: string
    plural?: string
  }
  admin?: {
    useAsTitle?: string
    defaultColumns?: string[]
    description?: string
    group?: string
  }
  auth?: boolean | AuthConfig
  access?: {
    read?: Access
    create?: Access
    update?: Access
    delete?: Access
    admin?: Access
  }
  fields: Field[]
  hooks?: {
    beforeValidate?: BeforeValidateHook[]
    beforeChange?: BeforeChangeHook[]
    afterChange?: AfterChangeHook[]
    afterRead?: AfterReadHook[]
    // ... other hooks
  }
  timestamps?: boolean
  // ... other options
}
```

### Access Control Type

```typescript
type Access = 
  | boolean 
  | (({ req, id, data, doc }: AccessArgs) => Promise<boolean | QueryConstraint>)

// QueryConstraint example:
{
  tenant: {
    equals: tenantId
  }
}

// Can also use operators:
{
  tenant: {
    equals: tenantId
  },
  status: {
    not_equals: 'deleted'
  }
}

// Available operators:
// equals, not_equals, exists, not_exists, contains, like, in, not_in,
// greater_than, less_than, greater_than_or_equal, less_than_or_equal,
// all, and, or, not
```

## Field Types for Multi-Tenancy

### Relationship Field

```typescript
{
  name: 'tenant',
  type: 'relationship',
  relationTo: 'tenants' | ['tenants', 'other'],
  hasMany?: false,              // Single relationship
  required?: boolean,
  validate?: (value, args) => true | 'error message',
  admin?: {
    position?: 'sidebar' | 'main',
    readOnly?: boolean | (({ user }) => boolean),
    hidden?: boolean | (({ data }) => boolean),
    condition?: (data) => boolean,
    description?: string,
    allowCreate?: boolean,
    allowEdit?: boolean,
  },
  hooks?: {
    beforeValidate?: BeforeValidateHook[]
    afterRead?: AfterReadHook[]
  }
}
```

### Checkbox Field

```typescript
{
  name: 'isSuperAdmin',
  type: 'checkbox',
  defaultValue?: false,
  admin?: {
    description?: string,
    readOnly?: boolean | (({ user }) => boolean),
  }
}
```

### Select Field

```typescript
{
  name: 'role',
  type: 'select',
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ],
  defaultValue?: 'viewer',
  required?: boolean,
  admin?: {
    description?: string,
  }
}
```

### Email Field

```typescript
{
  name: 'billingEmail',
  type: 'email',
  required?: boolean,
  unique?: boolean,
  admin?: {
    description?: string,
  }
}
```

### JSON Field

```typescript
{
  name: 'metadata',
  type: 'json',
  admin?: {
    description?: string,
  }
}
```

## Hooks Reference

### BeforeValidateHook

Runs before data validation.

```typescript
type BeforeValidateHook = async (args: {
  data: Record<string, unknown>
  req: PayloadRequest
  operation: 'create' | 'read' | 'update' | 'delete'
  collection?: CollectionConfig
}) => Promise<Record<string, unknown>>

// Example:
hooks: {
  beforeValidate: [
    async ({ data, req, operation }) => {
      if (operation === 'create' && req.user?.tenant) {
        data.tenant = req.user.tenant
      }
      return data
    }
  ]
}
```

### BeforeChangeHook

Runs before data is saved to database.

```typescript
type BeforeChangeHook = async (args: {
  data: Record<string, unknown>
  req: PayloadRequest
  operation: 'create' | 'update'
  collection?: CollectionConfig
}) => Promise<Record<string, unknown>>

// Example:
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      if (!data.tenant && req.user?.tenant) {
        data.tenant = req.user.tenant
      }
      return data
    }
  ]
}
```

### AfterChangeHook

Runs after data is saved to database.

```typescript
type AfterChangeHook = async (args: {
  doc: Record<string, unknown>
  req: PayloadRequest
  operation: 'create' | 'update'
  collection?: CollectionConfig
}) => Promise<Record<string, unknown> | void>

// Example:
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      console.log(`Document ${doc.id} was created for tenant ${doc.tenant}`)
    }
  ]
}
```

### AfterReadHook

Runs after document is retrieved.

```typescript
type AfterReadHook = async (args: {
  doc: Record<string, unknown>
  req: PayloadRequest
  collection?: CollectionConfig
}) => Promise<Record<string, unknown>>

// Example:
hooks: {
  afterRead: [
    async ({ doc, req }) => {
      // Populate relationship if it's a string
      if (typeof doc.tenant === 'string') {
        const tenant = await getPayload({ config }).findByID({
          collection: 'tenants',
          id: doc.tenant,
        })
        doc.tenant = tenant
      }
      return doc
    }
  ]
}
```

## Payload Core API

### getPayload()

Get Payload instance for querying.

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Or in server action:
export async function myServerAction() {
  const payload = await getPayload({ config })
  // ...
}
```

### find()

Query documents with optional filtering.

```typescript
const result = await payload.find({
  collection: 'users',
  where: {
    tenant: { equals: tenantId },
    role: { equals: 'admin' },
  },
  limit: 100,
  page: 1,
  sort: '-createdAt',
  select: { email: true, role: true },
  depth: 1,  // Populate relationships 1 level deep
})

// Result:
{
  docs: [/* array of documents */],
  totalDocs: 42,
  limit: 100,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
}
```

### findByID()

Get single document by ID.

```typescript
const user = await payload.findByID({
  collection: 'users',
  id: userId,
  depth: 2,
  select: { email: true, tenant: true, role: true },
})
```

### create()

Create new document.

```typescript
const newUser = await payload.create({
  collection: 'users',
  data: {
    email: 'user@example.com',
    password: 'secure-password',
    tenant: tenantId,
    role: 'admin',
    isSuperAdmin: false,
  },
  depth: 1,
})
```

### update()

Update existing document.

```typescript
const updated = await payload.update({
  collection: 'users',
  id: userId,
  data: {
    role: 'editor',
  },
  depth: 1,
})
```

### delete()

Delete document.

```typescript
await payload.delete({
  collection: 'users',
  id: userId,
})
```

### count()

Count documents matching query.

```typescript
const count = await payload.count({
  collection: 'media',
  where: {
    tenant: { equals: tenantId },
  },
})
```

## Access Control Patterns

### Super Admin + Tenant Filter Pattern

```typescript
access: {
  read: async ({ req }) => {
    if (req.user?.isSuperAdmin) {
      return true  // See all
    }
    return {
      tenant: { equals: req.user?.tenant }  // See only tenant
    }
  }
}
```

### Role-Based Access Pattern

```typescript
access: {
  create: async ({ req }) => {
    const user = req.user as User
    
    if (user.isSuperAdmin) {
      return true
    }
    
    const allowedRoles = ['admin', 'editor']
    return allowedRoles.includes(user.role as string)
  }
}
```

### Combined Pattern

```typescript
access: {
  delete: async ({ req }) => {
    const user = req.user as User
    
    if (!user) {
      return false
    }
    
    if (user.isSuperAdmin) {
      return true
    }
    
    // Regular user can only delete own documents
    return {
      tenant: { equals: user.tenant },
      createdBy: { equals: user.id },  // Assumes document has createdBy field
    }
  }
}
```

## Request Object Properties

### req.user

```typescript
interface User {
  id: string
  email: string
  isSuperAdmin?: boolean
  tenant?: string | TenantDocument
  role?: string
  // ... other fields
}

// Access in hook:
hooks: {
  beforeChange: [
    async ({ req }) => {
      const userId = req.user?.id
      const userTenant = req.user?.tenant
      const isSuperAdmin = req.user?.isSuperAdmin
    }
  ]
}
```

### req.headers

```typescript
// Access headers in hook or middleware:
const tenantSlug = req.headers.get('x-tenant-slug')
const host = req.headers.get('host')
const authorization = req.headers.get('authorization')
```

### req.payload

```typescript
// Payload instance available on request:
const documents = await req.payload.find({
  collection: 'media',
  where: { tenant: { equals: tenantId } }
})
```

## Query Operators Reference

```typescript
// Comparison
{ field: { equals: value } }
{ field: { not_equals: value } }
{ field: { in: [value1, value2] } }
{ field: { not_in: [value1, value2] } }

// String matching
{ field: { like: 'partial-match' } }
{ field: { contains: 'substring' } }

// Numeric
{ field: { greater_than: 10 } }
{ field: { less_than: 100 } }
{ field: { greater_than_or_equal: 10 } }
{ field: { less_than_or_equal: 100 } }

// Null checking
{ field: { exists: true } }
{ field: { exists: false } }

// Logical
{
  or: [
    { status: { equals: 'published' } },
    { author: { equals: userId } }
  ]
}

{
  and: [
    { tenant: { equals: tenantId } },
    { status: { equals: 'active' } }
  ]
}
```

## Type Definitions for Custom Code

### CollectionConfig Type

```typescript
import type { CollectionConfig } from 'payload'

interface MyCollection extends CollectionConfig {
  slug: 'my-collection'
  // ... fields and config
}
```

### Access Type

```typescript
import type { Access } from 'payload'

const myAccess: Access = async ({ req }) => {
  if (req.user?.isSuperAdmin) {
    return true
  }
  return false
}
```

### Hook Types

```typescript
import type { 
  BeforeValidateHook,
  BeforeChangeHook,
  AfterChangeHook,
  AfterReadHook,
} from 'payload'

const myHook: BeforeValidateHook = async (args) => {
  return args.data
}
```

### Payload Request Type

```typescript
import type { PayloadRequest } from 'payload'

function myFunction(req: PayloadRequest) {
  // req.user, req.payload, req.headers available
}
```

## Common Patterns

### Auto-Set Tenant on Create

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

### Validate User Belongs to Tenant

```typescript
access: {
  read: async ({ req, id }) => {
    const doc = await req.payload.findByID({
      collection: 'my-collection',
      id,
    })
    
    return doc.tenant === req.user?.tenant
  }
}
```

### Create Audit Log Entry

```typescript
hooks: {
  afterChange: [
    async ({ doc, req, operation }) => {
      await req.payload.create({
        collection: 'audit-logs',
        data: {
          action: operation,
          documentId: doc.id,
          userId: req.user?.id,
          tenant: req.user?.tenant,
          timestamp: new Date(),
        },
      })
    }
  ]
}
```

### Prevent Tenant Change

```typescript
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      if (operation === 'update' && !req.user?.isSuperAdmin) {
        // Prevent changing tenant field
        delete data.tenant
      }
      return data
    }
  ]
}
```

### Validate Max Users Per Tenant

```typescript
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      if (operation !== 'create') {
        return data
      }

      const tenant = await req.payload.findByID({
        collection: 'tenants',
        id: req.user?.tenant,
      })

      const userCount = await req.payload.count({
        collection: 'users',
        where: {
          tenant: { equals: req.user?.tenant },
        },
      })

      if (userCount >= tenant.maxUsers) {
        throw new Error(`Tenant reached maximum users limit (${tenant.maxUsers})`)
      }

      return data
    }
  ]
}
```

## Next.js Integration

### In Server Actions

```typescript
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function fetchTenantMedia(tenantId: string) {
  const payload = await getPayload({ config })
  
  return payload.find({
    collection: 'media',
    where: {
      tenant: { equals: tenantId }
    },
    limit: 50,
  })
}
```

### In API Routes

```typescript
// src/app/api/my-endpoint/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  
  const tenantId = request.headers.get('x-tenant-id')
  
  const result = await payload.find({
    collection: 'media',
    where: {
      tenant: { equals: tenantId }
    }
  })

  return Response.json(result)
}
```

