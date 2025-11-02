import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead } from '@/access'

/**
 * Footer Collection
 *
 * Defines footer layout and content per tenant
 * - Column structure (1-4 columns)
 * - Custom footer links
 * - Bottom bar with copyright
 * - Social media integration
 */
export const Footer: CollectionConfig = {
  slug: 'footer',
  admin: {
    useAsTitle: 'tenant',
    defaultColumns: ['tenant', 'columns', 'updatedAt'],
    description: 'Configure your website footer',
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
      ({ req, data, operation }) => {
        if (operation === 'create' && !data.tenant && req.user && !req.user.isSuperAdmin) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true, // One footer per tenant
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this footer belongs to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    // Layout
    {
      name: 'layout',
      type: 'group',
      label: 'Layout Settings',
      fields: [
        {
          name: 'columns',
          type: 'select',
          required: true,
          defaultValue: 4,
          options: [
            { label: '1 Column', value: 1 },
            { label: '2 Columns', value: 2 },
            { label: '3 Columns', value: 3 },
            { label: '4 Columns', value: 4 },
          ],
          admin: {
            description: 'Number of footer columns',
          },
        },
        {
          name: 'showSocialMedia',
          type: 'checkbox',
          label: 'Show Social Media Links',
          defaultValue: true,
          admin: {
            description: 'Display social media icons (from Site Settings)',
          },
        },
        {
          name: 'showNewsletter',
          type: 'checkbox',
          label: 'Show Newsletter Signup',
          defaultValue: false,
          admin: {
            description: 'Display newsletter subscription form',
          },
        },
      ],
    },
    // Column 1
    {
      name: 'column1',
      type: 'group',
      label: 'Column 1',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            placeholder: 'Over Ons',
          },
        },
        {
          name: 'content',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Optional text content (company description, etc.)',
            placeholder: 'Wij zijn een professioneel makelaarskantoor...',
          },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '@/components/admin/ArrayRowLabels#FooterLinkRowLabel',
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
          ],
        },
      ],
    },
    // Column 2
    {
      name: 'column2',
      type: 'group',
      label: 'Column 2',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            placeholder: 'Snelle Links',
          },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '@/components/admin/ArrayRowLabels#FooterLinkRowLabel',
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
          ],
        },
      ],
    },
    // Column 3
    {
      name: 'column3',
      type: 'group',
      label: 'Column 3',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            placeholder: 'Contact',
          },
        },
        {
          name: 'showContactInfo',
          type: 'checkbox',
          label: 'Show Contact Information',
          defaultValue: true,
          admin: {
            description: 'Display contact info from Site Settings',
          },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Additional Links',
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
          ],
        },
      ],
    },
    // Column 4
    {
      name: 'column4',
      type: 'group',
      label: 'Column 4',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            placeholder: 'Nieuwsbrief',
          },
        },
        {
          name: 'content',
          type: 'textarea',
          localized: true,
          admin: {
            placeholder: 'Blijf op de hoogte van ons laatste aanbod...',
          },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '@/components/admin/ArrayRowLabels#FooterLinkRowLabel',
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
          ],
        },
      ],
    },
    // Bottom Bar
    {
      name: 'bottomBar',
      type: 'group',
      label: 'Bottom Bar',
      fields: [
        {
          name: 'copyrightText',
          type: 'text',
          localized: true,
          admin: {
            placeholder: '© 2024 {Company Name}. Alle rechten voorbehouden.',
            description: 'Use {year} for current year, {company} for company name',
          },
        },
        {
          name: 'legalLinks',
          type: 'array',
          label: 'Legal Links',
          admin: {
            description: 'Privacy Policy, Terms, etc. (Note: Pages marked with "Show in Footer" also appear)',
            initCollapsed: true,
            components: {
              RowLabel: '@/components/admin/ArrayRowLabels#LegalLinkRowLabel',
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
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
