'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

/**
 * TenantSwitcher Component
 *
 * Displays current tenant and allows super-admins to switch between tenants
 * Only visible to users with isSuperAdmin: true
 */
export const TenantSwitcher: React.FC = () => {
  const { user } = useAuth()
  const [tenants, setTenants] = useState<any[]>([])
  const [currentTenant, setCurrentTenant] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch tenants and get current viewing tenant from cookie on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Fetch all tenants
        const response = await fetch('/api/tenants?limit=100', {
          credentials: 'include',
        })
        const data = await response.json()
        setTenants(data.docs || [])
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      }
    }

    // Get viewing tenant from cookie
    const viewingTenant = getCookie('viewing-tenant')
    setCurrentTenant(viewingTenant || 'all')

    fetchTenants()
  }, [])

  // Handle tenant switch
  const handleTenantSwitch = (tenantId: string) => {
    setLoading(true)

    if (tenantId === 'all') {
      // Clear cookie
      document.cookie = 'viewing-tenant=; path=/; max-age=0'
    } else {
      // Save to cookie (7 days expiration)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `viewing-tenant=${tenantId}; path=/; expires=${expires}`
    }

    // Reload page to apply filter
    window.location.reload()
  }

  // Helper to get cookie value
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  // Only show to super-admins
  if (!user?.isSuperAdmin) {
    return null
  }

  // Find current tenant object
  const currentTenantObj = tenants.find((t) => t.id === currentTenant)

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--theme-elevation-200)',
        backgroundColor: 'var(--theme-elevation-50)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--theme-elevation-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Super Admin
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label
          htmlFor="tenant-select"
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-elevation-800)',
          }}
        >
          Viewing Tenant:
        </label>

        <select
          id="tenant-select"
          value={currentTenant || 'all'}
          onChange={(e) => {
            const value = e.target.value
            handleTenantSwitch(value)
          }}
          disabled={loading}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '0.875rem',
            borderRadius: '0.25rem',
            border: '1px solid var(--theme-elevation-300)',
            backgroundColor: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-900)',
            cursor: 'pointer',
            minWidth: '200px',
          }}
        >
          <option value="all">All Tenants</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name} ({tenant.domain})
            </option>
          ))}
        </select>

        {currentTenantObj && (
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--theme-elevation-600)',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--theme-elevation-100)',
              borderRadius: '0.25rem',
            }}
          >
            Status: <strong>{currentTenantObj.status}</strong>
          </div>
        )}
      </div>

      {loading && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-600)',
          }}
        >
          Switching...
        </div>
      )}
    </div>
  )
}
