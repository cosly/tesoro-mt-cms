import type { PayloadRequest } from 'payload'

/**
 * Extract tenant from subdomain
 * Examples:
 *   tenant1.app.com -> 'tenant1'
 *   localhost:3000 -> null (development)
 */
export function extractTenantFromHost(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0]

  // Skip localhost and IP addresses
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null
  }

  // Extract subdomain (first part before first dot)
  const parts = hostname.split('.')

  // Need at least 2 parts (subdomain.domain.tld)
  if (parts.length < 2) {
    return null
  }

  // Return first part as tenant subdomain
  return parts[0]
}

/**
 * Get current tenant from request
 * Checks in order:
 * 1. req.context.tenant (already set)
 * 2. Subdomain from host header
 * 3. Custom X-Tenant-ID header (for API clients)
 */
export function getCurrentTenant(req: PayloadRequest): string | null {
  // Already set in context
  if (req.context?.tenant && typeof req.context.tenant === 'string') {
    return req.context.tenant
  }

  // Check custom header first (for API clients)
  const tenantHeader = req.headers?.get('x-tenant-id')
  if (tenantHeader && typeof tenantHeader === 'string') {
    return tenantHeader
  }

  // Extract from subdomain
  const host = req.headers?.get('host')
  if (!host) {
    return null
  }

  return extractTenantFromHost(host)
}

/**
 * Middleware to detect and set tenant context
 * Add this to your Next.js middleware
 */
export async function tenantMiddleware(req: PayloadRequest): Promise<void> {
  const tenantDomain = getCurrentTenant(req)

  if (tenantDomain) {
    // Find tenant by domain
    const { docs } = await req.payload.find({
      collection: 'tenants',
      where: {
        domain: {
          equals: tenantDomain,
        },
      },
      limit: 1,
    })

    if (docs.length > 0) {
      const tenant = docs[0]

      // Set tenant in request context
      req.context = {
        ...req.context,
        tenant: tenant.id,
        tenantData: tenant,
      }
    }
  }
}
