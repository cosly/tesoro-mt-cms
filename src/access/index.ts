import type { Access } from 'payload'

// Admin-only access for tenants
export const tenantAdminOnly: Access = ({ req }) => {
  const user = req?.user

  // Super admins can access everything
  if (user?.isSuperAdmin) {
    return true
  }

  // Tenant users can only access their own tenant's data
  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

// Read access for tenants
export const tenantRead: Access = ({ req }) => {
  const user = req?.user

  // Super admins can read everything
  if (user?.isSuperAdmin) {
    return true
  }

  // Tenant users can only read their own tenant's data
  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}

// Role-based access for tenants
export const tenantRoleAccess: Access = ({ req }) => {
  const user = req?.user

  // Super admins can access everything
  if (user?.isSuperAdmin) {
    return true
  }

  // Tenant users can only access their own tenant's data
  if (user?.tenant) {
    return {
      tenant: {
        equals: user.tenant,
      },
    }
  }

  return false
}
