import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead, tenantRoleAccess } from '@/access'

/**
 * Blog Collection
 *
 * Optional blog/news functionality per tenant
 * Can be enabled/disabled in Site Settings
 */
export const Blog: CollectionConfig = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedDate', 'status', 'tenant'],
    description: 'Manage blog posts and news articles',
    group: 'Content',
  },
  access: {
    read: tenantRead,
    // Admins and editors can create blog posts
    create: tenantRoleAccess(['admin', 'editor']),
    update: tenantRoleAccess(['admin', 'editor']),
    delete: tenantAdminOnly,
  },
  hooks: {
    beforeChange: [
      // Auto-assign tenant and author
      ({ req, data, operation }) => {
        if (operation === 'create') {
          if (!data.tenant && req.user && !req.user.isSuperAdmin) {
            data.tenant = req.user.tenant
          }
          if (!data.author && req.user) {
            data.author = req.user.id
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
        description: 'The tenant this post belongs to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Blog post title',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly slug (e.g., "new-property-tips")',
      },
      validate: (value: string | null | undefined) => {
        if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Slug must be lowercase alphanumeric with hyphens only'
        }
        return true
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short summary (shown in blog list)',
        placeholder: 'Een korte samenvatting van dit artikel...',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the blog post',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      admin: {
        description: 'Blog post content',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Post author',
      },
    },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Kooptips', value: 'buying-tips' },
        { label: 'Verkooptips', value: 'selling-tips' },
        { label: 'Marktanalyse', value: 'market-analysis' },
        { label: 'Nieuws', value: 'news' },
        { label: 'Guides', value: 'guides' },
        { label: 'Succesverhalen', value: 'success-stories' },
      ],
      admin: {
        description: 'Post categories',
      },
    },
    {
      name: 'tags',
      type: 'text',
      localized: true,
      admin: {
        description: 'Comma-separated tags',
        placeholder: 'hypotheek, eerste huis, tips',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Publication date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Post status',
      },
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
          localized: true,
          admin: {
            description: 'SEO title (60 chars recommended)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'SEO description (160 chars recommended)',
          },
        },
        {
          name: 'metaImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for social sharing (uses featured image if not set)',
          },
        },
      ],
    },
    // Reading time (auto-calculated can be added via hook)
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Estimated reading time in minutes',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
