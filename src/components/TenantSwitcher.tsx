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

  // Only show to super-admins
  if (!user?.isSuperAdmin) {
    return null
  }

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/tenants?limit=100', {
          credentials: 'include',
        })
        const data = await response.json()
        setTenants(data.docs || [])
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      }
    }

    fetchTenants()
  }, [])

  // Get current tenant from URL or context
  useEffect(() => {
    const tenantId = user?.tenant
    if (tenantId) {
      setCurrentTenant(tenantId)
    }
  }, [user])

  // Handle tenant switch
  const handleTenantSwitch = async (tenantId: string) => {
    setLoading(true)
    try {
      // Store selected tenant in session/localStorage
      localStorage.setItem('selectedTenant', tenantId)

      // Reload page to apply new tenant context
      window.location.reload()
    } catch (error) {
      console.error('Failed to switch tenant:', error)
      setLoading(false)
    }
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
            if (value === 'all') {
              localStorage.removeItem('selectedTenant')
              window.location.reload()
            } else {
              handleTenantSwitch(value)
            }
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
