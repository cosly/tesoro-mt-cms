import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js middleware for tenant detection
 * Runs before all routes
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Extract tenant from subdomain
  const tenantDomain = extractTenantFromHostname(hostname)

  // Create response
  const response = NextResponse.next()

  // Set tenant in header for Payload to pick up
  if (tenantDomain) {
    response.headers.set('x-tenant-id', tenantDomain)
  }

  return response
}

/**
 * Extract tenant subdomain from hostname
 */
function extractTenantFromHostname(hostname: string): string | null {
  // Remove port
  const host = hostname.split(':')[0]

  // Skip localhost and IPs
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }

  // Split by dots
  const parts = host.split('.')

  // Need at least subdomain.domain.tld
  if (parts.length < 2) {
    return null
  }

  // Return subdomain (first part)
  return parts[0]
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
