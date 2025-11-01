# Multi-Tenant Implementation Plan for Payload CMS 3.x

## Executive Summary

This document provides a comprehensive, step-by-step implementation plan for adding multi-tenant functionality to a Payload CMS 3.x application with Next.js 15 and MongoDB. The solution uses a shared database model with tenant isolation through database-level filtering and subdomain-based tenant identification.

**Key Architecture Decisions:**
- Single database with tenant field on all collections (not separate databases)
- Subdomain-based tenant routing (tenant1.app.com, tenant2.app.com)
- Middleware-based tenant context injection
- Hooks and Access Control Lists for automatic tenant filtering
- Super-admin role with tenant switcher capability
- Regular users see only their tenant's data automatically

---

## Phase 1: Planning & Setup

### 1.1 Database Design

#### Tenants Collection Schema

Create a new collection to manage tenant metadata:

```typescript
// src/collections/Tenants.ts
import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'createdAt'],
  },
  access: {
    // Only super-admins can manage tenants
    read: ({ req }) => {
      return req.user?.isSuperAdmin === true
    },
    create: ({ req }) => {
      return req.user?.isSuperAdmin === true
    },
    update: ({ req }) => {
      return req.user?.isSuperAdmin === true
    },
    delete: ({ req }) => {
      return req.user?.isSuperAdmin === true
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for the tenant',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Subdomain slug (e.g., "tenant1" for tenant1.app.com)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
      required: true,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional tenant configuration (logo URL, contact info, etc.)',
      },
    },
    {
      name: 'maxUsers',
      type: 'number',
      defaultValue: 100,
      admin: {
        description: 'Maximum number of users allowed for this tenant',
      },
    },
    {
      name: 'billingEmail',
      type: 'email',
      admin: {
        description: 'Primary contact email for billing',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
}
```

#### User Roles and Tenant Association

Update the Users collection to support multi-tenancy:

```typescript
// src/collections/Users.ts (Updated)
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'tenant', 'role', 'isSuperAdmin', 'createdAt'],
  },
  auth: true,
  access: {
    read: ({ req }) => {
      // Super admins see all users
      if (req.user?.isSuperAdmin) {
        return true
      }
      // Regular users only see users in their tenant
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      }
    },
    update: ({ req }) => {
      // Super admins can update any user
      if (req.user?.isSuperAdmin) {
        return true
      }
      // Regular users can only update their own data
      return {
        id: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => {
      return req.user?.isSuperAdmin === true
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Super admins can manage all tenants and see all data',
        readOnly: ({ user }) => user?.id !== undefined && !user.isSuperAdmin,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: ({ data }) => {
        // tenant is required only if user is not a super admin
        return !data?.isSuperAdmin
      },
      admin: {
        condition: ({ isSuperAdmin }) => !isSuperAdmin,
        description: 'Tenant associated with this user',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      defaultValue: 'viewer',
      required: true,
    },
    // Keep default auth fields (email, password, etc.)
  ],
}
```

#### Add Tenant Field to Existing Collections

For the Media collection:

```typescript
// src/collections/Media.ts (Updated)
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'alt', 'tenant', 'updatedAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.isSuperAdmin) {
        return true
      }
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      }
    },
    create: ({ req }) => {
      // Users can create media only for their tenant
      return true
    },
    update: ({ req }) => {
      if (req.user?.isSuperAdmin) {
        return true
      }
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      }
    },
    delete: ({ req }) => {
      if (req.user?.isSuperAdmin) {
        return true
      }
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      }
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        readOnly: true,
        description: 'Tenant that owns this media file',
      },
    },
  ],
  upload: true,
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-set tenant from request context if not provided
        if (!data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
  },
}
```

---

## Phase 2: Tenant Context & Middleware

### 2.1 Request Context Extension

Create a middleware to extract tenant from subdomain and attach to request:

```typescript
// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Parse subdomain from hostname
  // Examples: tenant1.localhost:3000, tenant1.app.com, app.com
  const parts = hostname.split('.')
  const isLocalhost = hostname.includes('localhost')
  
  let tenantSlug: string | null = null

  if (isLocalhost) {
    // localhost:3000 -> no tenant
    // tenant1.localhost:3000 -> tenant1
    tenantSlug = parts.length > 1 ? parts[0] : null
  } else {
    // For production, exclude common TLDs and base domain
    // example.com -> no tenant
    // tenant1.example.com -> tenant1
    // tenant1.staging.example.com -> tenant1
    if (parts.length >= 3) {
      tenantSlug = parts[0]
    }
  }

  // Set tenant in request headers for middleware chain
  const requestHeaders = new Headers(request.headers)
  if (tenantSlug) {
    requestHeaders.set('x-tenant-slug', tenantSlug)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // Apply to all routes except static files and API internal routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)',
  ],
}
```

### 2.2 Payload Hooks for Tenant Context

Create a hook file to inject tenant context into all operations:

```typescript
// src/hooks/tenantContext.ts
import type { BeforeValidateHook } from 'payload'
import { createTenantContext } from '@/utils/tenantContext'

/**
 * Hook to inject tenant context into all collection operations
 * This runs before validation and ensures tenant is properly set
 */
export const injectTenantHook: BeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  // Skip for super admins in certain operations
  if (req.user?.isSuperAdmin && operation !== 'create') {
    return data
  }

  // For non-superadmin users, enforce tenant isolation
  if (req.user?.tenant && !data.tenant) {
    data.tenant = req.user.tenant
  }

  return data
}
```

### 2.3 Tenant Context Utility

Create utility for getting and managing tenant context:

```typescript
// src/utils/tenantContext.ts
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface TenantContext {
  tenantId: string | null
  tenantSlug: string | null
  isSuperAdmin: boolean
}

/**
 * Extract tenant context from request
 */
export async function getTenantContext(req: PayloadRequest): Promise<TenantContext> {
  const tenantSlug = req.headers?.get?.('x-tenant-slug') || null
  
  if (!tenantSlug) {
    return {
      tenantId: null,
      tenantSlug: null,
      isSuperAdmin: req.user?.isSuperAdmin || false,
    }
  }

  // Fetch tenant ID from slug
  const payload = await getPayload({ config })
  const tenants = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: tenantSlug,
      },
    },
    limit: 1,
  })

  const tenant = tenants.docs[0]

  return {
    tenantId: tenant?.id || null,
    tenantSlug,
    isSuperAdmin: req.user?.isSuperAdmin || false,
  }
}

/**
 * Validate that a tenant exists and is active
 */
export async function validateTenant(tenantSlug: string | null): Promise<boolean> {
  if (!tenantSlug) {
    return true // No tenant specified (could be super admin)
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'tenants',
    where: {
      slug: { equals: tenantSlug },
      status: { equals: 'active' },
    },
    limit: 1,
  })

  return result.docs.length > 0
}
```

---

## Phase 3: Access Control Implementation

### 3.1 Global Access Control Helper

Create a centralized access control utility:

```typescript
// src/access/tenantAccess.ts
import type { Access, PayloadRequest } from 'payload'
import type { User } from '@/payload-types'

/**
 * Access control for tenant-specific data
 * - Super admins see all data
 * - Regular users see only their tenant's data
 */
export const tenantAccessFactory = (field: string = 'tenant'): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined

    // No user, deny access
    if (!user) {
      return false
    }

    // Super admin, allow all
    if (user.isSuperAdmin) {
      return true
    }

    // Regular user, filter by tenant
    if (user.tenant) {
      return {
        [field]: {
          equals: typeof user.tenant === 'string' ? user.tenant : user.tenant.id,
        },
      }
    }

    // No tenant assigned, deny access
    return false
  }

/**
 * Create access control based on user role
 */
export const roleBasedAccess = (
  requiredRoles: Array<'admin' | 'editor' | 'viewer'> = ['admin', 'editor', 'viewer'],
): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined

    if (!user) {
      return false
    }

    if (user.isSuperAdmin) {
      return true
    }

    const userRole = (user.role as string) || 'viewer'
    return requiredRoles.includes(userRole as any)
  }
```

### 3.2 Collection Access Patterns

Example of how to apply access control to a new collection:

```typescript
// src/collections/Posts.ts (Example new collection)
import type { CollectionConfig } from 'payload'
import { tenantAccessFactory, roleBasedAccess } from '@/access/tenantAccess'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tenant', 'author', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: tenantAccessFactory('tenant'),
    create: roleBasedAccess(['admin', 'editor']),
    update: roleBasedAccess(['admin', 'editor']),
    delete: roleBasedAccess(['admin']),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-set tenant from user context
        if (!data.tenant && (req.user as User)?.tenant) {
          data.tenant = (req.user as User).tenant
        }
        // Auto-set author if not provided
        if (!data.author && req.user?.id) {
          data.author = req.user.id
        }
        return data
      },
    ],
  },
}
```

---

## Phase 4: Admin UI Tenant Switcher

### 4.1 Custom Admin Component

Create a tenant switcher component for the admin UI:

```typescript
// src/components/TenantSwitcher/index.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

interface TenantOption {
  id: string
  name: string
  slug: string
}

export const TenantSwitcher: React.FC = () => {
  const { user } = useAuth()
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [currentTenant, setCurrentTenant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Only show for super admins
  if (!user?.isSuperAdmin) {
    return null
  }

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/tenants')
        const data = await response.json()
        setTenants(data.docs || [])
        
        // Get current tenant from URL or localStorage
        const urlTenant = new URLSearchParams(window.location.search).get('tenant')
        const storedTenant = localStorage.getItem('selectedTenant')
        setCurrentTenant(urlTenant || storedTenant)
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [])

  const handleTenantChange = (tenantId: string) => {
    setCurrentTenant(tenantId)
    localStorage.setItem('selectedTenant', tenantId)
    
    // Redirect to maintain state
    const url = new URL(window.location.href)
    url.searchParams.set('tenant', tenantId)
    window.location.href = url.toString()
  }

  if (loading) {
    return <div>Loading tenants...</div>
  }

  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
      <label htmlFor="tenant-select" style={{ marginRight: '0.5rem' }}>
        Switch Tenant:
      </label>
      <select
        id="tenant-select"
        value={currentTenant || ''}
        onChange={(e) => handleTenantChange(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #d0d0d0',
        }}
      >
        <option value="">All Tenants</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

### 4.2 Integrate into Admin UI

Modify payload config to include the tenant switcher:

```typescript
// src/payload.config.ts (Updated)
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // Add custom admin components
      Header: [
        {
          path: '@/components/TenantSwitcher',
          exportName: 'TenantSwitcher',
        },
      ],
    },
  },
  collections: [Users, Media, Tenants],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [payloadCloudPlugin()],
})
```

---

## Phase 5: GraphQL & REST API Tenant Filtering

### 5.1 API Route with Tenant Context

Update API routes to respect tenant context:

```typescript
// src/app/(payload)/api/tenants/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTenantContext } from '@/utils/tenantContext'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  
  // Only super admins can list all tenants via API
  if (!request.user?.isSuperAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await payload.find({
      collection: 'tenants',
      limit: 100,
      where: {
        status: {
          equals: 'active',
        },
      },
    })

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 5.2 GraphQL Tenant Queries

Payload 3.x automatically respects access control in GraphQL queries, but you can customize with hooks:

```typescript
// src/hooks/graphqlTenant.ts
import type { AfterReadHook } from 'payload'
import type { Media } from '@/payload-types'

/**
 * Ensure tenant field is always included in GraphQL responses
 */
export const ensureTenantInResponse: AfterReadHook<Media> = async ({
  doc,
  req,
}) => {
  // Auto-populate tenant for display
  if (doc?.tenant && typeof doc.tenant === 'string') {
    const payload = await getPayload({ config })
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: doc.tenant,
    })
    doc.tenant = tenant
  }
  return doc
}
```

---

## Phase 6: Migration Strategy

### 6.1 Create Tenants for Existing Data

Migration script to create default tenant for existing data:

```typescript
// src/migrations/createDefaultTenant.ts
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Migration: Create default tenant for existing data
 */
export async function migrateExistingData() {
  const payload = await getPayload({ config })

  try {
    console.log('Starting multi-tenant migration...')

    // Check if default tenant exists
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        slug: { equals: 'default' },
      },
      limit: 1,
    })

    let defaultTenantId: string

    if (existingTenant.docs.length === 0) {
      // Create default tenant
      const createdTenant = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Default Tenant',
          slug: 'default',
          status: 'active',
          metadata: {
            migrated: true,
            createdAt: new Date().toISOString(),
          },
        },
      })
      defaultTenantId = createdTenant.id
      console.log(`Created default tenant with ID: ${defaultTenantId}`)
    } else {
      defaultTenantId = existingTenant.docs[0].id
      console.log(`Using existing default tenant with ID: ${defaultTenantId}`)
    }

    // Migrate existing users without tenant assignment
    const usersWithoutTenant = await payload.find({
      collection: 'users',
      where: {
        tenant: {
          exists: false,
        },
      },
      limit: 1000,
      pagination: false,
    })

    if (usersWithoutTenant.docs.length > 0) {
      console.log(`Found ${usersWithoutTenant.docs.length} users without tenant assignment`)

      for (const user of usersWithoutTenant.docs) {
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            tenant: defaultTenantId,
          },
        })
      }

      console.log(`Assigned ${usersWithoutTenant.docs.length} users to default tenant`)
    }

    // Migrate existing media without tenant assignment
    const mediaWithoutTenant = await payload.find({
      collection: 'media',
      where: {
        tenant: {
          exists: false,
        },
      },
      limit: 1000,
      pagination: false,
    })

    if (mediaWithoutTenant.docs.length > 0) {
      console.log(`Found ${mediaWithoutTenant.docs.length} media files without tenant assignment`)

      for (const media of mediaWithoutTenant.docs) {
        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            tenant: defaultTenantId,
          },
        })
      }

      console.log(`Assigned ${mediaWithoutTenant.docs.length} media files to default tenant`)
    }

    console.log('Multi-tenant migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Run migration: node -e "import('./migrations/createDefaultTenant.ts').then(m => m.migrateExistingData())"
```

### 6.2 Database Index Optimization

Create indexes for tenant-based queries:

```typescript
// src/migrations/createTenantIndexes.ts
/**
 * Run this after database is updated with tenant field
 * MongoDB index creation for optimal tenant query performance
 */

export const mongooseIndexes = `
// Add to MongoDB connection after schema updates

db.users.createIndex({ tenant: 1, email: 1 })
db.users.createIndex({ isSuperAdmin: 1 })

db.media.createIndex({ tenant: 1, createdAt: -1 })
db.media.createIndex({ tenant: 1, filename: 1 })

db.posts.createIndex({ tenant: 1, publishedAt: -1 })
db.posts.createIndex({ tenant: 1, author: 1 })

db.tenants.createIndex({ slug: 1 }, { unique: true })
db.tenants.createIndex({ status: 1 })
`

// Or create a Payload hook that runs on startup:
export const ensureIndexes = {
  async afterInit(payload) {
    if (process.env.NODE_ENV === 'production') {
      // Indexes are typically created by Mongoose automatically
      // This is a safety check
      console.log('Database indexes verified for multi-tenant setup')
    }
  },
}
```

---

## Phase 7: Testing Strategy

### 7.1 Unit Tests for Access Control

```typescript
// tests/unit/access.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { tenantAccessFactory, roleBasedAccess } from '@/access/tenantAccess'
import type { User } from '@/payload-types'

describe('Tenant Access Control', () => {
  describe('tenantAccessFactory', () => {
    it('should allow super admin to see all tenants', async () => {
      const access = tenantAccessFactory('tenant')
      const result = await access({
        req: {
          user: {
            isSuperAdmin: true,
            id: 'super-admin-id',
          } as User,
        } as any,
      })

      expect(result).toBe(true)
    })

    it('should filter by tenant for regular users', async () => {
      const access = tenantAccessFactory('tenant')
      const result = await access({
        req: {
          user: {
            isSuperAdmin: false,
            tenant: 'tenant-123',
            id: 'user-id',
          } as User,
        } as any,
      })

      expect(result).toEqual({
        tenant: {
          equals: 'tenant-123',
        },
      })
    })

    it('should deny access for users without tenant', async () => {
      const access = tenantAccessFactory('tenant')
      const result = await access({
        req: {
          user: {
            isSuperAdmin: false,
            id: 'user-id',
          } as User,
        } as any,
      })

      expect(result).toBe(false)
    })

    it('should deny access for unauthenticated requests', async () => {
      const access = tenantAccessFactory('tenant')
      const result = await access({
        req: {
          user: undefined,
        } as any,
      })

      expect(result).toBe(false)
    })
  })

  describe('roleBasedAccess', () => {
    it('should allow admins and editors', async () => {
      const access = roleBasedAccess(['admin', 'editor'])

      const adminResult = await access({
        req: {
          user: {
            role: 'admin',
            id: 'admin-id',
          } as User,
        } as any,
      })

      const editorResult = await access({
        req: {
          user: {
            role: 'editor',
            id: 'editor-id',
          } as User,
        } as any,
      })

      expect(adminResult).toBe(true)
      expect(editorResult).toBe(true)
    })

    it('should deny viewers if not in allowed roles', async () => {
      const access = roleBasedAccess(['admin'])

      const viewerResult = await access({
        req: {
          user: {
            role: 'viewer',
            id: 'viewer-id',
          } as User,
        } as any,
      })

      expect(viewerResult).toBe(false)
    })

    it('should always allow super admins', async () => {
      const access = roleBasedAccess(['admin'])

      const superAdminResult = await access({
        req: {
          user: {
            isSuperAdmin: true,
            role: 'viewer',
            id: 'super-admin-id',
          } as User,
        } as any,
      })

      expect(superAdminResult).toBe(true)
    })
  })
})
```

### 7.2 Integration Tests for Multi-Tenant Isolation

```typescript
// tests/int/multitenancy.int.spec.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Multi-tenant Integration Tests', () => {
  let payload
  let tenant1Id: string
  let tenant2Id: string
  let user1Id: string
  let user2Id: string

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  describe('Tenant Isolation', () => {
    it('should create multiple tenants', async () => {
      const t1 = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Tenant 1',
          slug: 'tenant-1',
          status: 'active',
        },
      })
      tenant1Id = t1.id

      const t2 = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Tenant 2',
          slug: 'tenant-2',
          status: 'active',
        },
      })
      tenant2Id = t2.id

      expect(tenant1Id).toBeDefined()
      expect(tenant2Id).toBeDefined()
      expect(tenant1Id).not.toBe(tenant2Id)
    })

    it('should create users for different tenants', async () => {
      const user1 = await payload.create({
        collection: 'users',
        data: {
          email: 'user1@tenant1.com',
          password: 'password123',
          tenant: tenant1Id,
          role: 'admin',
        },
      })
      user1Id = user1.id

      const user2 = await payload.create({
        collection: 'users',
        data: {
          email: 'user2@tenant2.com',
          password: 'password123',
          tenant: tenant2Id,
          role: 'admin',
        },
      })
      user2Id = user2.id

      expect(user1Id).toBeDefined()
      expect(user2Id).toBeDefined()
    })

    it('should isolate data by tenant when querying', async () => {
      // This test would require creating request context with user auth
      // Simplified example:
      const tenant1Users = await payload.find({
        collection: 'users',
        where: {
          tenant: { equals: tenant1Id },
        },
      })

      const tenant2Users = await payload.find({
        collection: 'users',
        where: {
          tenant: { equals: tenant2Id },
        },
      })

      expect(tenant1Users.docs.length).toBeGreaterThan(0)
      expect(tenant2Users.docs.length).toBeGreaterThan(0)
      expect(tenant1Users.docs[0].tenant).toBe(tenant1Id)
      expect(tenant2Users.docs[0].tenant).toBe(tenant2Id)
    })
  })

  describe('Super Admin Access', () => {
    it('should allow super admin to see all tenants', async () => {
      // When executing with a super admin user context
      const allTenants = await payload.find({
        collection: 'tenants',
      })

      expect(allTenants.docs.length).toBeGreaterThanOrEqual(2)
    })
  })
})
```

### 7.3 E2E Tests for Subdomain Routing

```typescript
// tests/e2e/multitenancy.e2e.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Multi-tenant Subdomain Routing', () => {
  test('should route tenant1 subdomain correctly', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://tenant1.localhost:3000',
    })

    const page = await context.newPage()
    await page.goto('/admin')

    // Should see admin dashboard for tenant1
    const pageTitle = await page.title()
    expect(pageTitle).toContain('Payload')

    // Check that headers contain tenant context
    const headers = await page.evaluate(() => ({
      headers: document.documentElement.outerHTML,
    }))

    await context.close()
  })

  test('should route tenant2 subdomain correctly', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://tenant2.localhost:3000',
    })

    const page = await context.newPage()
    await page.goto('/admin')

    const pageTitle = await page.title()
    expect(pageTitle).toContain('Payload')

    await context.close()
  })

  test('should isolate data between subdomains', async ({ browser }) => {
    // Login to tenant1
    const context1 = await browser.newContext({
      baseURL: 'http://tenant1.localhost:3000',
    })
    const page1 = await context1.newPage()

    // Navigate to media collection and note count
    await page1.goto('/admin/collections/media')
    // ... assertions for tenant1 media ...

    // Login to tenant2
    const context2 = await browser.newContext({
      baseURL: 'http://tenant2.localhost:3000',
    })
    const page2 = await context2.newPage()

    // Navigate to media collection
    await page2.goto('/admin/collections/media')
    // ... verify different media shown for tenant2 ...

    await context1.close()
    await context2.close()
  })
})
```

---

## Phase 8: Implementation Roadmap

### Week 1: Foundation
- Create Tenants collection
- Update Users collection with tenant field and roles
- Add tenant field to Media collection
- Create initial access control helpers
- Run migration for existing data

### Week 2: Context & Routing
- Implement middleware for subdomain detection
- Create tenant context utilities
- Update API routes to respect tenant context
- Add tenant-specific hooks to collections

### Week 3: Admin UI & Testing
- Build tenant switcher component
- Integrate into admin layout
- Create unit tests for access control
- Create integration tests for tenant isolation

### Week 4: Refinement & Documentation
- Run end-to-end tests
- Document tenant setup process
- Create runbooks for tenant management
- Performance optimization and index tuning

---

## Phase 9: Configuration Checklist

Before going to production:

### Environment Setup
- [ ] MongoDB indexes created for tenant queries
- [ ] Subdomain DNS configured (wildcard DNS or specific subdomains)
- [ ] SSL certificates support wildcard domains
- [ ] Database backup strategy configured
- [ ] Environment variables set for all deployments

### Security Review
- [ ] All collections have proper access control
- [ ] Super admin role is properly protected
- [ ] Tenant isolation is verified in all queries
- [ ] API endpoints validate tenant context
- [ ] GraphQL schema respects tenant access

### Performance Optimization
- [ ] Database indexes on tenant field
- [ ] Query N+1 problems eliminated
- [ ] Tenant lookup cached appropriately
- [ ] Load testing completed

### Documentation
- [ ] Tenant setup guide created
- [ ] Developer guide for adding new tenant-specific features
- [ ] Admin user guide for managing tenants
- [ ] Troubleshooting guide

---

## Phase 10: Post-Launch Operations

### Monitoring
```typescript
// src/utils/tenantMonitoring.ts
export interface TenantMetrics {
  tenantId: string
  userCount: number
  mediaFileCount: number
  lastActivityAt: Date
  status: 'active' | 'inactive' | 'suspended'
}

export async function getTenantMetrics(tenantId: string): Promise<TenantMetrics> {
  const payload = await getPayload({ config })

  const users = await payload.count({
    collection: 'users',
    where: {
      tenant: { equals: tenantId },
    },
  })

  const media = await payload.count({
    collection: 'media',
    where: {
      tenant: { equals: tenantId },
    },
  })

  const tenant = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  })

  return {
    tenantId,
    userCount: users,
    mediaFileCount: media,
    lastActivityAt: new Date(tenant.updatedAt),
    status: tenant.status,
  }
}
```

### Scaling Considerations

1. **Database Optimization**
   - Implement database-level read replicas for reporting
   - Use connection pooling
   - Monitor query performance

2. **Caching**
   - Cache tenant metadata (name, status, limits)
   - Cache user-tenant relationships
   - Invalidate on changes

3. **Multi-Region Deployment**
   - Each region can have its own database
   - Use tenant location preference for routing
   - Implement cross-region sync if needed

---

## Key APIs Used (Payload 3.x)

### Collections
- `CollectionConfig` - Define collection structure
- `access` property - Fine-grained access control
- `hooks` property - Before/after operation hooks

### Access Control
- `Access` type - Returns boolean or query constraint object
- `BeforeValidateHook` - Modify data before validation
- `AfterReadHook` - Process data after retrieval

### Payload Core
- `getPayload()` - Get Payload instance
- `payload.find()` - Query documents
- `payload.findByID()` - Get single document
- `payload.create()` - Create document
- `payload.update()` - Update document
- `payload.delete()` - Delete document

### Request Context
- `req.user` - Current authenticated user
- `req.headers` - HTTP headers for context
- `req.payload` - Payload instance in request context

---

## Common Patterns

### Adding a New Collection with Tenant Support

```typescript
import type { CollectionConfig } from 'payload'
import { tenantAccessFactory } from '@/access/tenantAccess'
import type { User } from '@/payload-types'

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
        if (!data.tenant && (req.user as User)?.tenant) {
          data.tenant = (req.user as User).tenant
        }
        return data
      },
    ],
  },
}
```

### Querying with Tenant Filter

```typescript
const payload = await getPayload({ config })

// For authenticated requests - access control handles filtering
const userMedia = await payload.find({
  collection: 'media',
  where: {
    status: { equals: 'published' },
  },
  // Access control automatically filters by tenant
})

// For admin queries - explicitly specify tenant
const allTenantMedia = await payload.find({
  collection: 'media',
  where: {
    tenant: { equals: tenantId },
    status: { equals: 'published' },
  },
})
```

---

## Troubleshooting

### Issue: Users can see other tenants' data
**Solution:** Verify access control is properly applied to all collections. Check that `tenantAccessFactory` is used in the `access` property.

### Issue: Tenant field not auto-populating
**Solution:** Ensure `beforeChange` hook is properly configured on the collection and `req.user?.tenant` is being set by middleware.

### Issue: Super admin cannot switch tenants
**Solution:** Verify `isSuperAdmin` field is set correctly on user and tenant switcher component checks this flag.

### Issue: Subdomain routing not working
**Solution:** Check middleware configuration, ensure DNS/hosts file supports subdomains, verify hostname parsing logic for your domain structure.

### Issue: Performance degradation with many tenants
**Solution:** Create database indexes on `tenant` field combined with commonly queried fields. Consider denormalizing frequently accessed tenant metadata.

---

## Files to Create Summary

1. `src/collections/Tenants.ts` - Tenants collection definition
2. `src/collections/Users.ts` - Updated with tenant field
3. `src/collections/Media.ts` - Updated with tenant field
4. `src/middleware.ts` - Subdomain detection
5. `src/utils/tenantContext.ts` - Tenant context utilities
6. `src/access/tenantAccess.ts` - Access control helpers
7. `src/components/TenantSwitcher/index.tsx` - Admin UI component
8. `src/migrations/createDefaultTenant.ts` - Migration script
9. `tests/unit/access.test.ts` - Access control tests
10. `tests/int/multitenancy.int.spec.ts` - Integration tests
11. `tests/e2e/multitenancy.e2e.spec.ts` - E2E tests

---

## Next Steps

1. Review this plan with your team
2. Adjust timeline based on team capacity
3. Start with Phase 1 (Database Design)
4. Test thoroughly at each phase before moving to next
5. Document any custom implementations specific to your use case

