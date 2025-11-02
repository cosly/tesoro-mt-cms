import type { GlobalConfig } from 'payload'
import { seoFields } from '@/fields/seo'

/**
 * Home Global
 *
 * Homepage-specific content and settings per tenant
 * This is tenant-scoped, so each tenant has their own homepage configuration
 */
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: {
    group: 'Website',
    description: 'Configure your homepage content and SEO',
    components: {
      AfterDocument: '@/components/admin/SEOPreview#SEOPreview',
    },
  },
  access: {
    read: () => true, // Public read access for frontend
    update: ({ req: { user } }) => {
      // Only admins can update
      return Boolean(user)
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
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
                    description: 'Hero achtergrond afbeelding',
                  },
                },
                {
                  name: 'primaryButton',
                  type: 'group',
                  label: 'Primary Button',
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: {
                        placeholder: 'Bekijk woningen',
                      },
                    },
                    {
                      name: 'link',
                      type: 'text',
                      required: true,
                      admin: {
                        placeholder: '/woningen',
                      },
                    },
                  ],
                },
                {
                  name: 'secondaryButton',
                  type: 'group',
                  label: 'Secondary Button',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      label: 'Show Secondary Button',
                      defaultValue: false,
                    },
                    {
                      name: 'text',
                      type: 'text',
                      localized: true,
                      admin: {
                        placeholder: 'Over ons',
                        condition: (data, siblingData) => siblingData.enabled === true,
                      },
                    },
                    {
                      name: 'link',
                      type: 'text',
                      admin: {
                        placeholder: '/over-ons',
                        condition: (data, siblingData) => siblingData.enabled === true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Featured Properties',
          fields: [
            {
              name: 'featuredProperties',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Show Featured Properties Section',
                  defaultValue: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  admin: {
                    placeholder: 'Uitgelichte Woningen',
                    condition: (data, siblingData) => siblingData.enabled === true,
                  },
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  localized: true,
                  admin: {
                    placeholder: 'Bekijk onze nieuwste aanbiedingen',
                    condition: (data, siblingData) => siblingData.enabled === true,
                  },
                },
                {
                  name: 'maxProperties',
                  type: 'number',
                  defaultValue: 6,
                  min: 3,
                  max: 12,
                  admin: {
                    description: 'Aantal woningen om te tonen',
                    condition: (data, siblingData) => siblingData.enabled === true,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoFields],
        },
      ],
    },
  ],
}
