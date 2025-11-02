import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead } from '@/access'

/**
 * Site Settings Collection
 *
 * Per-tenant site configuration:
 * - Feature toggles (enable/disable collections like blog, news, etc.)
 * - SEO defaults
 * - Social media links
 * - Contact information
 * - Analytics & tracking
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'tenant',
    defaultColumns: ['tenant', 'updatedAt'],
    description: 'Configure website features and general settings',
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
      unique: true, // One site settings per tenant
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant these settings belong to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    // Page Assignments
    {
      name: 'pages',
      type: 'group',
      label: 'Page Assignments',
      admin: {
        description: 'Assign special pages for your website',
      },
      fields: [
        {
          name: 'homepage',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            description: 'Select which page is your homepage',
          },
        },
        {
          name: 'notFoundPage',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            description: 'Custom 404 page (optional)',
          },
        },
      ],
    },
    // Legal Pages
    {
      name: 'legalPages',
      type: 'group',
      label: 'Legal Pages',
      admin: {
        description: 'Assign legal & policy pages',
      },
      fields: [
        {
          name: 'privacyPolicy',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            description: 'Privacy Policy page',
          },
        },
        {
          name: 'termsAndConditions',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            description: 'Terms & Conditions page',
          },
        },
        {
          name: 'cookiePolicy',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            description: 'Cookie Policy page',
          },
        },
      ],
    },
    // Feature Toggles
    {
      name: 'features',
      type: 'group',
      label: 'Features',
      admin: {
        description: 'Enable or disable features for your website',
      },
      fields: [
        {
          name: 'enableBlog',
          type: 'checkbox',
          label: 'Enable Blog',
          defaultValue: false,
          admin: {
            description: 'Show blog/news section on your website',
          },
        },
        {
          name: 'enableTestimonials',
          type: 'checkbox',
          label: 'Enable Testimonials',
          defaultValue: true,
          admin: {
            description: 'Show client testimonials and reviews',
          },
        },
        {
          name: 'enableTeamPage',
          type: 'checkbox',
          label: 'Enable Team/Agent Page',
          defaultValue: true,
          admin: {
            description: 'Show team members (data from CRM)',
          },
        },
        {
          name: 'enableContactForm',
          type: 'checkbox',
          label: 'Enable Contact Forms',
          defaultValue: true,
          admin: {
            description: 'Allow visitors to submit contact forms',
          },
        },
        {
          name: 'enableNewsletter',
          type: 'checkbox',
          label: 'Enable Newsletter Signup',
          defaultValue: false,
          admin: {
            description: 'Show newsletter subscription forms',
          },
        },
        {
          name: 'enableSearch',
          type: 'checkbox',
          label: 'Enable Property Search',
          defaultValue: true,
          admin: {
            description: 'Show property search functionality',
          },
        },
      ],
    },
    // SEO Defaults
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Defaults',
      admin: {
        description: 'Default SEO settings for your website',
      },
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
          localized: true,
          admin: {
            description: 'Default page title (used when page has no specific title)',
            placeholder: 'Makelaarskantoor | Uw droomhuis',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Default meta description (160 characters recommended)',
            placeholder: 'Wij helpen u bij het vinden van uw droomhuis...',
          },
        },
        {
          name: 'defaultImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Default Open Graph image for social sharing',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          localized: true,
          admin: {
            description: 'Default keywords (comma-separated)',
            placeholder: 'makelaar, vastgoed, huis kopen, huis verkopen',
          },
        },
      ],
    },
    // Contact Information
    {
      name: 'contact',
      type: 'group',
      label: 'Contact Information',
      admin: {
        description: 'Your business contact details',
      },
      fields: [
        {
          name: 'companyName',
          type: 'text',
          admin: {
            description: 'Official company name',
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'General contact email',
          },
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Main phone number',
            placeholder: '+31 20 123 4567',
          },
        },
        {
          name: 'address',
          type: 'group',
          label: 'Address',
          fields: [
            {
              name: 'street',
              type: 'text',
              admin: {
                placeholder: 'Hoofdstraat 123',
              },
            },
            {
              name: 'city',
              type: 'text',
              admin: {
                placeholder: 'Amsterdam',
              },
            },
            {
              name: 'postalCode',
              type: 'text',
              admin: {
                placeholder: '1012 AB',
              },
            },
            {
              name: 'country',
              type: 'text',
              defaultValue: 'Nederland',
              admin: {
                placeholder: 'Nederland',
              },
            },
          ],
        },
        {
          name: 'openingHours',
          type: 'textarea',
          admin: {
            description: 'Opening hours (plain text or HTML)',
            placeholder: 'Ma-Vr: 9:00 - 17:00\nZa: 10:00 - 14:00',
          },
        },
      ],
    },
    // Social Media
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media',
      admin: {
        description: 'Your social media profile links',
      },
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
            placeholder: 'https://instagram.com/yourprofile',
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
        {
          name: 'youtube',
          type: 'text',
          admin: {
            placeholder: 'https://youtube.com/yourchannel',
          },
        },
      ],
    },
    // Analytics & Tracking
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics & Tracking',
      admin: {
        description: 'Analytics and tracking configuration',
      },
      fields: [
        {
          name: 'googleAnalyticsId',
          type: 'text',
          admin: {
            description: 'Google Analytics ID (e.g., G-XXXXXXXXXX)',
            placeholder: 'G-XXXXXXXXXX',
          },
        },
        {
          name: 'googleTagManagerId',
          type: 'text',
          admin: {
            description: 'Google Tag Manager ID (e.g., GTM-XXXXXXX)',
            placeholder: 'GTM-XXXXXXX',
          },
        },
        {
          name: 'facebookPixelId',
          type: 'text',
          admin: {
            description: 'Facebook Pixel ID',
            placeholder: '1234567890',
          },
        },
        {
          name: 'customScripts',
          type: 'group',
          label: 'Custom Scripts',
          fields: [
            {
              name: 'headScript',
              type: 'textarea',
              admin: {
                description: 'Custom scripts to inject in <head> (advanced users only)',
                placeholder: '<script>...</script>',
              },
            },
            {
              name: 'bodyScript',
              type: 'textarea',
              admin: {
                description: 'Custom scripts to inject before </body> (advanced users only)',
                placeholder: '<script>...</script>',
              },
            },
          ],
        },
      ],
    },
    // Additional Settings
    {
      name: 'additional',
      type: 'group',
      label: 'Additional Settings',
      fields: [
        {
          name: 'maintenanceMode',
          type: 'checkbox',
          label: 'Maintenance Mode',
          defaultValue: false,
          admin: {
            description: 'Enable to show maintenance page to visitors',
          },
        },
        {
          name: 'maintenanceMessage',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Message to display during maintenance',
            placeholder: 'We are currently updating our website. Please check back soon!',
            condition: (data) => data.additional?.maintenanceMode === true,
          },
        },
        {
          name: 'cookieConsent',
          type: 'checkbox',
          label: 'Show Cookie Consent Banner',
          defaultValue: true,
          admin: {
            description: 'Show cookie consent banner (GDPR compliance)',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
