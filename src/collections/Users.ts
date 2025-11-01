import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'tenant', 'role', 'isSuperAdmin'],
  },
  auth: true,
  access: {
    // Super admins can read all users, regular users only their tenant's users
    read: ({ req: { user } }) => {
      if (user?.isSuperAdmin) {
        return true
      }
      return {
        tenant: {
          equals: user?.tenant,
        },
      }
    },
    // Only super admins can create users
    create: ({ req: { user } }) => {
      return user?.isSuperAdmin === true
    },
    // Users can update their own profile, super admins can update anyone
    update: ({ req: { user } }) => {
      if (user?.isSuperAdmin) {
        return true
      }
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Only super admins can delete users
    delete: ({ req: { user } }) => {
      return user?.isSuperAdmin === true
    },
  },
  fields: [
    // Email added by default
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'The tenant this user belongs to',
        condition: (data, siblingData, { user }) => {
          // Only show tenant field to super admins
          return user?.isSuperAdmin === true
        },
      },
      access: {
        // Super admins can change tenant, regular users cannot
        update: ({ req: { user } }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Super admins can manage all tenants',
        condition: (data, siblingData, { user }) => {
          // Only show to super admins
          return user?.isSuperAdmin === true
        },
      },
      access: {
        // Only super admins can modify this field
        create: ({ req: { user } }) => user?.isSuperAdmin === true,
        update: ({ req: { user } }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      admin: {
        description: 'User role within their tenant',
      },
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
  ],
}
