import type { Access, AccessArgs } from 'payload'

/**
 * Access control factory for tenant-scoped collections
 * Super-admins can see all, regular users only their tenant's data
 */

/**
 * Get the viewing tenant from request header (for super-admins)
 * Next.js middleware sets this header from cookie
 */
function getViewingTenant(req: any): string | null {
  try {
    // Check for x-viewing-tenant header
    const viewingTenant = req.headers?.['x-viewing-tenant']

    if (viewingTenant && typeof viewingTenant === 'string') {
      return viewingTenant
    }

    return null
  } catch (error) {
    return null
  }
}

export const tenantRead: Access = ({ req: { user }, req }) => {
  // Super admins: check if they're viewing a specific tenant
  if (user?.isSuperAdmin) {
    const viewingTenant = getViewingTenant(req)

    if (viewingTenant) {
      // Filter to the selected tenant
      return {
        tenant: {
          equals: viewingTenant,
        },
      }
    }

    // No filter - show all tenants
    return true
  }

  // Regular users only see their tenant's data
  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  // Not logged in or no tenant
  return false
}

export const tenantCreate: Access = ({ req: { user } }) => {
  // Must be logged in with a tenant
  return !!(user && user.tenant)
}

export const tenantUpdate: Access = ({ req: { user }, req }) => {
  // Super admins: respect viewing tenant filter
  if (user?.isSuperAdmin) {
    const viewingTenant = getViewingTenant(req)

    if (viewingTenant) {
      return {
        tenant: {
          equals: viewingTenant,
        },
      }
    }

    // No filter - can update all
    return true
  }

  // Regular users can only update their tenant's data
  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

export const tenantDelete: Access = ({ req: { user }, req }) => {
  // Super admins: respect viewing tenant filter
  if (user?.isSuperAdmin) {
    const viewingTenant = getViewingTenant(req)

    if (viewingTenant) {
      return {
        tenant: {
          equals: viewingTenant,
        },
      }
    }

    // No filter - can delete all
    return true
  }

  // Regular users can only delete their tenant's data
  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

/**
 * Admin-only access (within tenant)
 * Only tenant admins and super admins can perform action
 */
export const tenantAdminOnly: Access = ({ req: { user }, req }) => {
  // Super admins: respect viewing tenant filter
  if (user?.isSuperAdmin) {
    const viewingTenant = getViewingTenant(req)

    if (viewingTenant) {
      return {
        tenant: {
          equals: viewingTenant,
        },
      }
    }

    // No filter - can do anything
    return true
  }

  // Must be admin role within their tenant
  if (user?.tenant && user?.role === 'admin') {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

/**
 * Role-based access within tenant
 * @param roles - Array of allowed roles (e.g., ['admin', 'editor'])
 */
export function tenantRoleAccess(roles: string[]): Access {
  return ({ req: { user }, req }) => {
    // Super admins: respect viewing tenant filter
    if (user?.isSuperAdmin) {
      const viewingTenant = getViewingTenant(req)

      if (viewingTenant) {
        return {
          tenant: {
            equals: viewingTenant,
          },
        }
      }

      // No filter - can do anything
      return true
    }

    // Check if user has required role
    if (user?.tenant && user?.role && roles.includes(user.role)) {
      return {
        tenant: {
          equals: user.tenant,
        },
      }
    }

    return false
  }
}

/**
 * Public read, tenant-scoped write
 * Useful for collections like Media that need public access
 */
export const publicReadTenantWrite = {
  read: () => true,
  create: tenantCreate,
  update: tenantUpdate,
  delete: tenantDelete,
}

/**
 * Full tenant isolation
 * All operations are tenant-scoped
 */
export const fullTenantIsolation = {
  read: tenantRead,
  create: tenantCreate,
  update: tenantUpdate,
  delete: tenantDelete,
}
