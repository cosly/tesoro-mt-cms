import type { Field } from 'payload'

/**
 * Reusable SEO Fields Group
 *
 * Provides comprehensive SEO metadata fields:
 * - Meta title & description
 * - Open Graph tags (Facebook, LinkedIn)
 * - Twitter Card tags
 * - Canonical URL override
 * - Robots meta tags
 * - OG image
 */
export const seoFields: Field = {
  type: 'group',
  name: 'seo',
  label: 'SEO & Social Media',
  admin: {
    description: 'Optimize how this page appears in search engines and social media',
  },
  fields: [
    {
      type: 'ui',
      name: 'seoPreview',
      admin: {
        components: {
          Field: '@/components/admin/SEOPreview#SEOPreview',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
          localized: true,
          admin: {
            description: 'Optimaal: 50-60 karakters. Laat leeg voor automatisch gegenereerde titel.',
            placeholder: 'Auto-generated from page title',
          },
          maxLength: 70,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Meta Description',
      localized: true,
      admin: {
        description: 'Optimaal: 150-160 karakters. Verschijnt in zoekresultaten.',
        placeholder: 'Auto-generated from page content',
      },
      maxLength: 180,
    },
    {
      type: 'collapsible',
      label: 'Facebook Sharing',
      admin: {
        initCollapsed: true,
        description: 'Customize how this page appears when shared on Facebook',
      },
      fields: [
        {
          name: 'ogTitle',
          type: 'text',
          label: 'Facebook Title',
          localized: true,
          admin: {
            description: 'Laat leeg om Meta Title te gebruiken.',
            placeholder: 'Fallback: Meta Title',
          },
          maxLength: 70,
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          label: 'Facebook Description',
          localized: true,
          admin: {
            description: 'Laat leeg om Meta Description te gebruiken.',
            placeholder: 'Fallback: Meta Description',
          },
          maxLength: 200,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Facebook Image',
          admin: {
            description: 'Aanbevolen: 1200x630px. Laat leeg voor standaard afbeelding.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'X.com (Twitter) Sharing',
      admin: {
        initCollapsed: true,
        description: 'Customize how this page appears when shared on X.com (Twitter)',
      },
      fields: [
        {
          name: 'twitterTitle',
          type: 'text',
          label: 'X.com Title',
          localized: true,
          admin: {
            description: 'Laat leeg om Meta Title te gebruiken.',
            placeholder: 'Fallback: Meta Title',
          },
          maxLength: 70,
        },
        {
          name: 'twitterDescription',
          type: 'textarea',
          label: 'X.com Description',
          localized: true,
          admin: {
            description: 'Laat leeg om Meta Description te gebruiken.',
            placeholder: 'Fallback: Meta Description',
          },
          maxLength: 200,
        },
        {
          name: 'twitterImage',
          type: 'upload',
          relationTo: 'media',
          label: 'X.com Image',
          admin: {
            description: 'Aanbevolen: 1200x675px. Laat leeg om Facebook Image te gebruiken.',
          },
        },
        {
          name: 'twitterCard',
          type: 'select',
          label: 'X.com Card Type',
          defaultValue: 'summary_large_image',
          options: [
            {
              label: 'Summary Card with Large Image',
              value: 'summary_large_image',
            },
            {
              label: 'Summary Card',
              value: 'summary',
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'WhatsApp Sharing',
      admin: {
        initCollapsed: true,
        description: 'Customize how this page appears when shared on WhatsApp',
      },
      fields: [
        {
          name: 'whatsappTitle',
          type: 'text',
          label: 'WhatsApp Title',
          localized: true,
          admin: {
            description: 'Laat leeg om Meta Title te gebruiken.',
            placeholder: 'Fallback: Meta Title',
          },
          maxLength: 70,
        },
        {
          name: 'whatsappDescription',
          type: 'textarea',
          label: 'WhatsApp Description',
          localized: true,
          admin: {
            description: 'Laat leeg om Meta Description te gebruiken.',
            placeholder: 'Fallback: Meta Description',
          },
          maxLength: 200,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Geavanceerde SEO',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'canonicalUrl',
          type: 'text',
          label: 'Canonical URL',
          admin: {
            description: 'Optioneel: Geef een aangepaste canonical URL op voor duplicate content.',
            placeholder: 'https://example.com/page',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'noIndex',
              type: 'checkbox',
              label: 'No Index',
              defaultValue: false,
              admin: {
                description: 'Verberg deze pagina van zoekmachines',
              },
            },
            {
              name: 'noFollow',
              type: 'checkbox',
              label: 'No Follow',
              defaultValue: false,
              admin: {
                description: 'Volg links op deze pagina niet',
              },
            },
          ],
        },
      ],
    },
  ],
}
