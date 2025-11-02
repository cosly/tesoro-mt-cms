import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'status', 'createdAt'],
    group: 'System',
  },
  access: {
    // Only super admins can manage tenants
    create: ({ req: { user } }) => {
      return user?.isSuperAdmin === true
    },
    read: ({ req: { user } }) => {
      // Super admins see all tenants
      if (user?.isSuperAdmin) {
        return true
      }
      // Regular users only see their own tenant
      return {
        id: {
          equals: user?.tenant,
        },
      }
    },
    update: ({ req: { user } }) => {
      return user?.isSuperAdmin === true
    },
    delete: ({ req: { user } }) => {
      return user?.isSuperAdmin === true
    },
  },
  hooks: {
    afterCreate: [
      // Auto-create Theme Settings and Site Settings for new tenant
      async ({ doc, req }) => {
        const { payload } = req

        try {
          // Create default Theme Settings
          await payload.create({
            collection: 'theme-settings',
            data: {
              tenant: doc.id,
              template: 'modern',
              colors: {
                primary: '#1E40AF',
                secondary: '#64748B',
                accent: '#F59E0B',
                background: '#FFFFFF',
              },
              typography: {
                headingFont: 'Montserrat',
                bodyFont: 'Open Sans',
              },
              styling: {
                borderRadius: 8,
                buttonStyle: 'rounded',
                shadowIntensity: 'subtle',
              },
            },
          })

          // Create default Site Settings
          await payload.create({
            collection: 'site-settings',
            data: {
              tenant: doc.id,
              features: {
                enableBlog: false,
                enableTestimonials: true,
                enableTeamPage: true,
                enableContactForm: true,
                enableNewsletter: false,
                enableSearch: true,
              },
              seo: {
                defaultTitle: doc.name,
                defaultDescription: `Welkom bij ${doc.name}`,
              },
              contact: {
                companyName: doc.name,
                email: doc.metadata?.contactEmail || '',
              },
              additional: {
                maintenanceMode: false,
                cookieConsent: true,
              },
            },
          })

          console.log(`[Tenants] Auto-created settings for tenant: ${doc.name}`)
        } catch (error) {
          console.error(`[Tenants] Failed to create settings for tenant ${doc.name}:`, error)
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Subdomain for this tenant (e.g., "tenant1" for tenant1.app.com)',
      },
      validate: (value) => {
        // Validate subdomain format
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
          return 'Domain must be lowercase alphanumeric with hyphens only'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Suspended',
          value: 'suspended',
        },
      ],
      admin: {
        description: 'Tenant status',
      },
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'theme',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
          ],
          defaultValue: 'default',
        },
        {
          name: 'maxUsers',
          type: 'number',
          min: 1,
          defaultValue: 10,
          admin: {
            description: 'Maximum number of users allowed for this tenant',
          },
        },
        {
          name: 'maxStorage',
          type: 'number',
          min: 1,
          defaultValue: 1024,
          admin: {
            description: 'Maximum storage in MB',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'contactEmail',
          type: 'email',
        },
        {
          name: 'contactName',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
      ],
    },
  ],
  timestamps: true,
}
