import type { GlobalConfig } from 'payload'
import { seoFields } from '@/fields/seo'

/**
 * Contact Global
 *
 * Contact page content and company information per tenant
 * This is tenant-scoped, so each tenant has their own contact configuration
 */
export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contact Page',
  admin: {
    group: 'Website',
    description: 'Configure your contact page and company information',
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
          label: 'Page Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                placeholder: 'Neem Contact Op',
              },
            },
            {
              name: 'subtitle',
              type: 'textarea',
              localized: true,
              admin: {
                placeholder: 'Heeft u vragen? Wij helpen u graag verder',
              },
            },
          ],
        },
        {
          label: 'Company Info',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'Makelaardij BV',
              },
            },
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: 'Hoofdstraat 123',
                  },
                },
                {
                  name: 'postalCode',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: '1234 AB',
                  },
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: 'Amsterdam',
                  },
                },
                {
                  name: 'country',
                  type: 'text',
                  defaultValue: 'Nederland',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'phone',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: '+31 20 123 4567',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  admin: {
                    placeholder: 'info@makelaardij.nl',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'kvkNumber',
                  type: 'text',
                  label: 'KVK Number',
                  admin: {
                    placeholder: '12345678',
                    description: 'Kamer van Koophandel nummer',
                  },
                },
                {
                  name: 'btwNumber',
                  type: 'text',
                  label: 'BTW Number',
                  admin: {
                    placeholder: 'NL123456789B01',
                    description: 'BTW identificatienummer',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Opening Hours',
          fields: [
            {
              name: 'openingHours',
              type: 'array',
              label: 'Opening Hours',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'day',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Maandag', value: 'monday' },
                        { label: 'Dinsdag', value: 'tuesday' },
                        { label: 'Woensdag', value: 'wednesday' },
                        { label: 'Donderdag', value: 'thursday' },
                        { label: 'Vrijdag', value: 'friday' },
                        { label: 'Zaterdag', value: 'saturday' },
                        { label: 'Zondag', value: 'sunday' },
                      ],
                    },
                    {
                      name: 'openTime',
                      type: 'text',
                      required: true,
                      admin: {
                        placeholder: '09:00',
                      },
                    },
                    {
                      name: 'closeTime',
                      type: 'text',
                      required: true,
                      admin: {
                        placeholder: '17:00',
                      },
                    },
                    {
                      name: 'closed',
                      type: 'checkbox',
                      label: 'Closed',
                      defaultValue: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Social Media',
          fields: [
            {
              name: 'socialMedia',
              type: 'group',
              fields: [
                {
                  name: 'facebook',
                  type: 'text',
                  admin: {
                    placeholder: 'https://facebook.com/yourpage',
                  },
                },
                {
                  name: 'instagram',
                  type: 'text',
                  admin: {
                    placeholder: 'https://instagram.com/yourpage',
                  },
                },
                {
                  name: 'linkedin',
                  type: 'text',
                  admin: {
                    placeholder: 'https://linkedin.com/company/yourcompany',
                  },
                },
                {
                  name: 'twitter',
                  type: 'text',
                  admin: {
                    placeholder: 'https://twitter.com/yourhandle',
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
