import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      label: 'Super Admin',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
  ],
}
