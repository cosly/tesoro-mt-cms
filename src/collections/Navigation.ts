import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead } from '@/access'

/**
 * Navigation Collection
 *
 * Defines main navigation menu structure per tenant
 * - Custom menu items (internal pages or external links)
 * - Logo position & menu style
 * - Dropdown/mega menu support
 */
export const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'logoPosition', 'updatedAt'],
    description: 'Configure your main navigation menu',
    group: 'Website',
  },
  access: {
    read: tenantRead,
    create: tenantAdminOnly,
    update: tenantAdminOnly,
    delete: ({ req: { user } }) => user?.isSuperAdmin === true,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Auto-assign tenant for non-super admins
        if (operation === 'create' && !data.tenant && req.user && !req.user.isSuperAdmin) {
          data.tenant = req.user.tenant
        }

        // Auto-generate name from tenant
        if (data.tenant) {
          const tenantId = typeof data.tenant === 'string' ? data.tenant : data.tenant.id
          const tenant = await req.payload.findByID({
            collection: 'tenants',
            id: tenantId,
          })
          data.name = `Navigation - ${tenant.name}`
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated from tenant name',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true, // One navigation per tenant
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this navigation belongs to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menu Items',
          fields: [
            {
              name: 'menuItems',
              type: 'array',
              label: 'Menu Items',
              admin: {
                description: 'Custom navigation menu items (Note: Pages with "Show in Navigation" will also appear)',
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/admin/ArrayRowLabels#MenuItemRowLabel',
                },
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  defaultValue: 'page',
                  options: [
                    { label: 'Link to Page', value: 'page' },
                    { label: 'External URL', value: 'url' },
                    { label: 'Dropdown Group', value: 'group' },
                  ],
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  admin: {
                    placeholder: 'Menu Label',
                  },
                },
                // For type: 'page'
                {
                  name: 'page',
                  type: 'relationship',
                  relationTo: 'pages',
                  admin: {
                    condition: (data, siblingData) => siblingData.type === 'page',
                  },
                },
                // For type: 'url'
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    placeholder: 'https://example.com',
                    condition: (data, siblingData) => siblingData.type === 'url',
                  },
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Open link in new tab',
                    condition: (data, siblingData) => siblingData.type === 'url',
                  },
                },
                // For type: 'group' (dropdown)
                {
                  name: 'children',
                  type: 'array',
                  label: 'Dropdown Items',
                  admin: {
                    description: 'Sub-menu items',
                    condition: (data, siblingData) => siblingData.type === 'group',
                    initCollapsed: true,
                    components: {
                      RowLabel: '@/components/admin/ArrayRowLabels#DropdownItemRowLabel',
                    },
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      defaultValue: 'page',
                      options: [
                        { label: 'Link to Page', value: 'page' },
                        { label: 'External URL', value: 'url' },
                      ],
                    },
                    {
                      name: 'page',
                      type: 'relationship',
                      relationTo: 'pages',
                      admin: {
                        condition: (data, siblingData) => siblingData.type === 'page',
                      },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => siblingData.type === 'url',
                      },
                    },
                    {
                      name: 'description',
                      type: 'text',
                      localized: true,
                      admin: {
                        placeholder: 'Optional description for mega menu',
                      },
                    },
                  ],
                },
                {
                  name: 'icon',
                  type: 'text',
                  admin: {
                    description: 'Optional icon name (e.g., "home", "info")',
                    placeholder: 'home',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'logoPosition',
              type: 'select',
              required: true,
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                description: 'Logo position in header',
              },
            },
            {
              name: 'menuStyle',
              type: 'select',
              required: true,
              defaultValue: 'horizontal',
              options: [
                { label: 'Horizontal', value: 'horizontal' },
                { label: 'Dropdown', value: 'dropdown' },
                { label: 'Mega Menu', value: 'mega' },
              ],
              admin: {
                description: 'Navigation menu style',
              },
            },
            {
              name: 'stickyHeader',
              type: 'checkbox',
              label: 'Sticky Header',
              defaultValue: true,
              admin: {
                description: 'Keep header visible when scrolling',
              },
            },
          ],
        },
        {
          label: 'CTA Button',
          description: 'Optional call-to-action button in header',
          fields: [
            {
              name: 'ctaEnabled',
              type: 'checkbox',
              label: 'Show CTA Button',
              defaultValue: false,
            },
            {
              name: 'ctaText',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Contact Ons',
                condition: (data, siblingData) => siblingData.ctaEnabled === true,
              },
            },
            {
              name: 'ctaLink',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                condition: (data, siblingData) => siblingData.ctaEnabled === true,
              },
            },
            {
              name: 'ctaStyle',
              type: 'select',
              defaultValue: 'primary',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
              ],
              admin: {
                condition: (data, siblingData) => siblingData.ctaEnabled === true,
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
