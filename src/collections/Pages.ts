import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead } from '@/access'

/**
 * Pages Collection
 *
 * Dynamic pages per tenant with flexible block-based content builder
 * Each tenant can have multiple pages with localized content
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tenant', 'status', 'updatedAt'],
    description: 'Build your website pages with flexible content blocks',
    group: 'Website',
  },
  access: {
    read: tenantRead,
    create: tenantAdminOnly,
    update: tenantAdminOnly,
    delete: tenantAdminOnly,
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
        description: 'The tenant this page belongs to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Page title (e.g., "About Us", "Contact")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'URL-friendly slug (e.g., "about-us", "contact")',
      },
      validate: (value: string | null | undefined) => {
        // Validate slug format
        if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Slug must be lowercase alphanumeric with hyphens only (e.g., "about-us")'
        }
        return true
      },
    },
    // Block-based Content Builder
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Page Content',
      admin: {
        description: 'Build your page using content blocks',
      },
      blocks: [
        // Hero Block
        {
          slug: 'hero',
          labels: {
            singular: 'Hero Section',
            plural: 'Hero Sections',
          },
          fields: [
            {
              name: 'variant',
              type: 'select',
              required: true,
              defaultValue: 'image',
              options: [
                { label: 'Image Background', value: 'image' },
                { label: 'Video Background', value: 'video' },
                { label: 'Slider/Carousel', value: 'slider' },
              ],
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                placeholder: 'Vind uw droomhuis',
              },
            },
            {
              name: 'subtitle',
              type: 'textarea',
              localized: true,
              admin: {
                placeholder: 'Wij helpen u bij het vinden van de perfecte woning',
              },
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data, siblingData) =>
                  siblingData.variant === 'image' || siblingData.variant === 'slider',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              admin: {
                placeholder: 'https://www.youtube.com/watch?v=...',
                condition: (data, siblingData) => siblingData.variant === 'video',
              },
            },
            {
              name: 'height',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small (400px)', value: 'small' },
                { label: 'Medium (600px)', value: 'medium' },
                { label: 'Large (800px)', value: 'large' },
                { label: 'Full Screen', value: 'fullscreen' },
              ],
            },
            {
              name: 'buttons',
              type: 'array',
              label: 'Call-to-Action Buttons',
              maxRows: 2,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/admin/ArrayRowLabels#ButtonRowLabel',
                },
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'link',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: '/contact',
                  },
                },
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'primary',
                  options: [
                    { label: 'Primary', value: 'primary' },
                    { label: 'Secondary', value: 'secondary' },
                    { label: 'Outline', value: 'outline' },
                  ],
                },
              ],
            },
          ],
        },
        // Text Content Block
        {
          slug: 'textContent',
          labels: {
            singular: 'Text Content',
            plural: 'Text Content Blocks',
          },
          fields: [
            {
              name: 'columns',
              type: 'select',
              required: true,
              defaultValue: 1,
              options: [
                { label: 'Single Column', value: 1 },
                { label: 'Two Columns', value: 2 },
                { label: 'Three Columns', value: 3 },
              ],
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              localized: true,
            },
          ],
        },
        // Property Showcase Block (data from CRM API)
        {
          slug: 'propertyShowcase',
          labels: {
            singular: 'Property Showcase',
            plural: 'Property Showcases',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Uitgelichte Woningen',
              },
            },
            {
              name: 'subtitle',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Bekijk onze nieuwste aanbiedingen',
              },
            },
            {
              name: 'layout',
              type: 'select',
              required: true,
              defaultValue: 'grid',
              options: [
                { label: 'Grid', value: 'grid' },
                { label: 'List', value: 'list' },
                { label: 'Carousel', value: 'carousel' },
              ],
            },
            {
              name: 'filter',
              type: 'group',
              label: 'Property Filters (CRM API)',
              fields: [
                {
                  name: 'propertyType',
                  type: 'select',
                  options: [
                    { label: 'All Types', value: 'all' },
                    { label: 'For Sale', value: 'sale' },
                    { label: 'For Rent', value: 'rent' },
                  ],
                  defaultValue: 'all',
                },
                {
                  name: 'featured',
                  type: 'checkbox',
                  label: 'Featured Properties Only',
                  defaultValue: false,
                },
                {
                  name: 'maxResults',
                  type: 'number',
                  defaultValue: 6,
                  min: 1,
                  max: 20,
                  admin: {
                    description: 'Maximum number of properties to display',
                  },
                },
              ],
            },
          ],
        },
        // Agent/Team Grid Block (data from CRM API)
        {
          slug: 'agentGrid',
          labels: {
            singular: 'Team/Agent Grid',
            plural: 'Team/Agent Grids',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Ons Team',
              },
            },
            {
              name: 'subtitle',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Maak kennis met onze makelaars',
              },
            },
            {
              name: 'columns',
              type: 'select',
              defaultValue: 3,
              options: [
                { label: '2 Columns', value: 2 },
                { label: '3 Columns', value: 3 },
                { label: '4 Columns', value: 4 },
              ],
            },
          ],
        },
        // Contact Form Block
        {
          slug: 'contactForm',
          labels: {
            singular: 'Contact Form',
            plural: 'Contact Forms',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Neem Contact Op',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: {
                placeholder: 'Heeft u vragen? Neem gerust contact met ons op.',
              },
            },
            {
              name: 'formFields',
              type: 'select',
              required: true,
              hasMany: true,
              defaultValue: ['name', 'email', 'phone', 'message'],
              options: [
                { label: 'Name', value: 'name' },
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
                { label: 'Subject', value: 'subject' },
                { label: 'Message', value: 'message' },
              ],
            },
            {
              name: 'submitAction',
              type: 'select',
              required: true,
              defaultValue: 'crm-api',
              options: [
                { label: 'Send to CRM API', value: 'crm-api' },
                { label: 'Send Email', value: 'email' },
                { label: 'Both', value: 'both' },
              ],
            },
          ],
        },
        // Image Gallery Block
        {
          slug: 'imageGallery',
          labels: {
            singular: 'Image Gallery',
            plural: 'Image Galleries',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'grid',
              options: [
                { label: 'Grid', value: 'grid' },
                { label: 'Masonry', value: 'masonry' },
                { label: 'Carousel', value: 'carousel' },
              ],
            },
            {
              name: 'images',
              type: 'array',
              required: true,
              minRows: 1,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/admin/ArrayRowLabels#ImageRowLabel',
                },
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                },
              ],
            },
          ],
        },
        // Testimonials Block
        {
          slug: 'testimonials',
          labels: {
            singular: 'Testimonials',
            plural: 'Testimonials Blocks',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                placeholder: 'Wat Onze Klanten Zeggen',
              },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'slider',
              options: [
                { label: 'Slider', value: 'slider' },
                { label: 'Grid', value: 'grid' },
              ],
            },
            {
              name: 'testimonials',
              type: 'array',
              required: true,
              minRows: 1,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/admin/ArrayRowLabels#TestimonialRowLabel',
                },
              },
              fields: [
                {
                  name: 'quote',
                  type: 'textarea',
                  required: true,
                  localized: true,
                },
                {
                  name: 'author',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'role',
                  type: 'text',
                  localized: true,
                  admin: {
                    placeholder: 'Koper',
                  },
                },
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'rating',
                  type: 'number',
                  min: 1,
                  max: 5,
                  admin: {
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
        // Call-to-Action Block
        {
          slug: 'cta',
          labels: {
            singular: 'Call-to-Action',
            plural: 'Call-to-Action Blocks',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'backgroundColor',
              type: 'text',
              admin: {
                placeholder: '#1E40AF',
                description: 'Hex color (overrides background image)',
              },
            },
            {
              name: 'button',
              type: 'group',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'link',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'primary',
                  options: [
                    { label: 'Primary', value: 'primary' },
                    { label: 'Secondary', value: 'secondary' },
                    { label: 'White', value: 'white' },
                  ],
                },
              ],
            },
          ],
        },
        // Spacer Block
        {
          slug: 'spacer',
          labels: {
            singular: 'Spacer',
            plural: 'Spacers',
          },
          fields: [
            {
              name: 'height',
              type: 'select',
              required: true,
              defaultValue: 'medium',
              options: [
                { label: 'Small (2rem)', value: 'small' },
                { label: 'Medium (4rem)', value: 'medium' },
                { label: 'Large (6rem)', value: 'large' },
                { label: 'Extra Large (8rem)', value: 'xlarge' },
              ],
            },
          ],
        },
      ],
    },
    // Navigation Settings
    {
      name: 'navigation',
      type: 'group',
      label: 'Navigation & Footer',
      admin: {
        description: 'Control where this page appears in menus',
      },
      fields: [
        {
          name: 'showInNavigation',
          type: 'checkbox',
          label: 'Show in Main Navigation',
          defaultValue: false,
          admin: {
            description: 'Display this page in the main navigation menu',
          },
        },
        {
          name: 'navigationLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Custom label for navigation (uses page title if empty)',
            placeholder: 'Leave empty to use page title',
            condition: (data, siblingData) => siblingData.showInNavigation === true,
          },
        },
        {
          name: 'navigationOrder',
          type: 'number',
          admin: {
            description: 'Order in navigation (lower numbers appear first)',
            step: 1,
            condition: (data, siblingData) => siblingData.showInNavigation === true,
          },
        },
        {
          name: 'showInFooter',
          type: 'checkbox',
          label: 'Show in Footer',
          defaultValue: false,
          admin: {
            description: 'Display this page in the footer',
          },
        },
        {
          name: 'footerColumn',
          type: 'select',
          options: [
            { label: 'Column 1', value: 'col1' },
            { label: 'Column 2', value: 'col2' },
            { label: 'Column 3', value: 'col3' },
            { label: 'Column 4', value: 'col4' },
          ],
          admin: {
            description: 'Which footer column to display this page in',
            condition: (data, siblingData) => siblingData.showInFooter === true,
          },
        },
        {
          name: 'footerOrder',
          type: 'number',
          admin: {
            description: 'Order within footer column (lower numbers appear first)',
            step: 1,
            condition: (data, siblingData) => siblingData.showInFooter === true,
          },
        },
      ],
    },
    // SEO Fields
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
            description: 'Page title for search engines (60 chars recommended)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
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
          localized: true,
          admin: {
            description: 'Comma-separated keywords',
          },
        },
      ],
    },
    // Publishing Status
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
  timestamps: true,
}
