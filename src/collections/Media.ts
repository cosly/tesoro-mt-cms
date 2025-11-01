import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Public read access for media
    read: () => true,
    // Only authenticated users from same tenant can create media
    create: ({ req: { user } }) => {
      return !!user
    },
    // Super admins see all media, regular users only their tenant's media
    update: ({ req: { user } }) => {
      if (user?.isSuperAdmin) {
        return true
      }
      return {
        tenant: {
          equals: user?.tenant,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.isSuperAdmin) {
        return true
      }
      return {
        tenant: {
          equals: user?.tenant,
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
      index: true,
      admin: {
        description: 'The tenant this media belongs to',
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return user?.isSuperAdmin === true
        },
      },
      access: {
        // Auto-set from user's tenant, only super admins can change
        update: ({ req: { user } }) => user?.isSuperAdmin === true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Auto-assign tenant from user if not set
      ({ req, data }) => {
        if (!data.tenant && req.user && !req.user.isSuperAdmin) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
  },
  upload: true,
}
