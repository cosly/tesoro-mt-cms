'use client'

import { useEffect } from 'react'

/**
 * TenantContextProvider
 *
 * Intercepts all fetch requests and adds X-Viewing-Tenant header
 * based on localStorage value set by TenantSwitcher
 */
export const TenantContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch

    // Override fetch to add X-Viewing-Tenant header
    window.fetch = async (...args) => {
      const [resource, config] = args

      // Get viewing tenant from localStorage
      const viewingTenant = localStorage.getItem('viewing-tenant')

      if (viewingTenant && viewingTenant !== 'all') {
        // Add X-Viewing-Tenant header to request
        const headers = new Headers(config?.headers)
        headers.set('X-Viewing-Tenant', viewingTenant)

        // Merge headers back into config
        const newConfig = {
          ...config,
          headers,
        }

        return originalFetch(resource, newConfig)
      }

      // No viewing tenant, proceed as normal
      return originalFetch(...args)
    }

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return <>{children}</>
}
