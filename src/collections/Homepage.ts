import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead } from '@/access'

/**
 * Homepage Collection
 *
 * Singleton per tenant - each tenant can have only ONE homepage
 * Contains hero section, content blocks, and SEO metadata
 */
export const Homepage: CollectionConfig = {
  slug: 'homepage',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tenant', 'updatedAt'],
    description: 'Manage your homepage content (one per tenant)',
  },
  access: {
    // Tenant admins can read their tenant's homepage
    read: tenantRead,
    // Tenant admins can create (but only if they don't have one already)
    create: tenantAdminOnly,
    // Tenant admins can update their tenant's homepage
    update: tenantAdminOnly,
    // Only super admins can delete
    delete: ({ req: { user } }) => user?.isSuperAdmin === true,
  },
  hooks: {
    beforeChange: [
      // Auto-assign tenant on create
      ({ req, data, operation }) => {
        if (operation === 'create' && !data.tenant && req.user && !req.user.isSuperAdmin) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
    beforeValidate: [
      // Prevent multiple homepages per tenant
      async ({ req, data, operation }) => {
        if (operation === 'create') {
          const tenantId = data.tenant || req.user?.tenant

          if (!tenantId) {
            throw new Error('Tenant is required')
          }

          // Check if homepage already exists for this tenant
          const existing = await req.payload.find({
            collection: 'homepage',
            where: {
              tenant: {
                equals: tenantId,
              },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            throw new Error('A homepage already exists for this tenant. Please edit the existing homepage instead.')
          }
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
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this homepage belongs to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Homepage',
      admin: {
        description: 'Internal title for reference',
      },
    },
    // Hero Section
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'headline',
          type: 'text',
          required: true,
          admin: {
            description: 'Main headline displayed on the homepage',
          },
        },
        {
          name: 'subheadline',
          type: 'textarea',
          admin: {
            description: 'Supporting text below the headline',
          },
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Hero background image or featured image',
          },
        },
        {
          name: 'ctaButton',
          type: 'group',
          label: 'Call-to-Action Button',
          fields: [
            {
              name: 'text',
              type: 'text',
              admin: {
                description: 'Button text (e.g., "Get Started")',
              },
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                description: 'Button link URL',
              },
            },
            {
              name: 'style',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
              ],
              defaultValue: 'primary',
            },
          ],
        },
      ],
    },
    // Main Content
    {
      name: 'content',
      type: 'richText',
      label: 'Main Content',
      admin: {
        description: 'Rich content for the homepage body',
      },
    },
    // Features Section
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      admin: {
        description: 'Highlight key features or benefits',
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Icon or image for this feature',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Page title for search engines (60 chars recommended)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Page description for search engines (160 chars recommended)',
          },
        },
        {
          name: 'metaImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for social media sharing (Open Graph)',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords',
          },
        },
      ],
    },
    // Status
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Publishing status',
      },
    },
  ],
}
