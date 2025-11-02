import type { Field } from 'payload'
import { nl } from '@/translations/nl'
import { en } from '@/translations/en'
import { es } from '@/translations/es'
import { de } from '@/translations/de'
import { pl } from '@/translations/pl'

/**
 * Reusable SEO Fields Group
 *
 * Provides comprehensive SEO metadata fields:
 * - Meta title & description
 * - Open Graph tags (Facebook, LinkedIn)
 * - Twitter Card tags
 * - WhatsApp preview
 * - Canonical URL override
 * - Robots meta tags
 * - OG image
 *
 * All labels, descriptions, and placeholders are translatable in 5 languages.
 */
export const seoFields: Field = {
  type: 'group',
  name: 'seo',
  label: {
    nl: nl.seo.groupLabel,
    en: en.seo.groupLabel,
    es: es.seo.groupLabel,
    de: de.seo.groupLabel,
    pl: pl.seo.groupLabel,
  },
  admin: {
    description: {
      nl: nl.seo.groupDescription,
      en: en.seo.groupDescription,
      es: es.seo.groupDescription,
      de: de.seo.groupDescription,
      pl: pl.seo.groupDescription,
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            nl: nl.seo.metaTitle.label,
            en: en.seo.metaTitle.label,
            es: es.seo.metaTitle.label,
            de: de.seo.metaTitle.label,
            pl: pl.seo.metaTitle.label,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.metaTitle.description,
              en: en.seo.metaTitle.description,
              es: es.seo.metaTitle.description,
              de: de.seo.metaTitle.description,
              pl: pl.seo.metaTitle.description,
            },
            placeholder: {
              nl: nl.seo.metaTitle.placeholder,
              en: en.seo.metaTitle.placeholder,
              es: es.seo.metaTitle.placeholder,
              de: de.seo.metaTitle.placeholder,
              pl: pl.seo.metaTitle.placeholder,
            },
          },
          maxLength: 70,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        nl: nl.seo.metaDescription.label,
        en: en.seo.metaDescription.label,
        es: es.seo.metaDescription.label,
        de: de.seo.metaDescription.label,
        pl: pl.seo.metaDescription.label,
      },
      localized: true,
      admin: {
        description: {
          nl: nl.seo.metaDescription.description,
          en: en.seo.metaDescription.description,
          es: es.seo.metaDescription.description,
          de: de.seo.metaDescription.description,
          pl: pl.seo.metaDescription.description,
        },
        placeholder: {
          nl: nl.seo.metaDescription.placeholder,
          en: en.seo.metaDescription.placeholder,
          es: es.seo.metaDescription.placeholder,
          de: de.seo.metaDescription.placeholder,
          pl: pl.seo.metaDescription.placeholder,
        },
      },
      maxLength: 180,
    },
    {
      type: 'collapsible',
      label: {
        nl: nl.seo.facebook.collapsibleLabel,
        en: en.seo.facebook.collapsibleLabel,
        es: es.seo.facebook.collapsibleLabel,
        de: de.seo.facebook.collapsibleLabel,
        pl: pl.seo.facebook.collapsibleLabel,
      },
      admin: {
        initCollapsed: true,
        description: {
          nl: nl.seo.facebook.collapsibleDescription,
          en: en.seo.facebook.collapsibleDescription,
          es: es.seo.facebook.collapsibleDescription,
          de: de.seo.facebook.collapsibleDescription,
          pl: pl.seo.facebook.collapsibleDescription,
        },
      },
      fields: [
        {
          name: 'ogTitle',
          type: 'text',
          label: {
            nl: nl.seo.facebook.titleLabel,
            en: en.seo.facebook.titleLabel,
            es: es.seo.facebook.titleLabel,
            de: de.seo.facebook.titleLabel,
            pl: pl.seo.facebook.titleLabel,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.facebook.titleDescription,
              en: en.seo.facebook.titleDescription,
              es: es.seo.facebook.titleDescription,
              de: de.seo.facebook.titleDescription,
              pl: pl.seo.facebook.titleDescription,
            },
            placeholder: {
              nl: nl.seo.facebook.titlePlaceholder,
              en: en.seo.facebook.titlePlaceholder,
              es: es.seo.facebook.titlePlaceholder,
              de: de.seo.facebook.titlePlaceholder,
              pl: pl.seo.facebook.titlePlaceholder,
            },
          },
          maxLength: 70,
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          label: {
            nl: nl.seo.facebook.descriptionLabel,
            en: en.seo.facebook.descriptionLabel,
            es: es.seo.facebook.descriptionLabel,
            de: de.seo.facebook.descriptionLabel,
            pl: pl.seo.facebook.descriptionLabel,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.facebook.descriptionDescription,
              en: en.seo.facebook.descriptionDescription,
              es: es.seo.facebook.descriptionDescription,
              de: de.seo.facebook.descriptionDescription,
              pl: pl.seo.facebook.descriptionDescription,
            },
            placeholder: {
              nl: nl.seo.facebook.descriptionPlaceholder,
              en: en.seo.facebook.descriptionPlaceholder,
              es: es.seo.facebook.descriptionPlaceholder,
              de: de.seo.facebook.descriptionPlaceholder,
              pl: pl.seo.facebook.descriptionPlaceholder,
            },
          },
          maxLength: 200,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            nl: nl.seo.facebook.imageLabel,
            en: en.seo.facebook.imageLabel,
            es: es.seo.facebook.imageLabel,
            de: de.seo.facebook.imageLabel,
            pl: pl.seo.facebook.imageLabel,
          },
          admin: {
            description: {
              nl: nl.seo.facebook.imageDescription,
              en: en.seo.facebook.imageDescription,
              es: es.seo.facebook.imageDescription,
              de: de.seo.facebook.imageDescription,
              pl: pl.seo.facebook.imageDescription,
            },
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: {
        nl: nl.seo.twitter.collapsibleLabel,
        en: en.seo.twitter.collapsibleLabel,
        es: es.seo.twitter.collapsibleLabel,
        de: de.seo.twitter.collapsibleLabel,
        pl: pl.seo.twitter.collapsibleLabel,
      },
      admin: {
        initCollapsed: true,
        description: {
          nl: nl.seo.twitter.collapsibleDescription,
          en: en.seo.twitter.collapsibleDescription,
          es: es.seo.twitter.collapsibleDescription,
          de: de.seo.twitter.collapsibleDescription,
          pl: pl.seo.twitter.collapsibleDescription,
        },
      },
      fields: [
        {
          name: 'twitterTitle',
          type: 'text',
          label: {
            nl: nl.seo.twitter.titleLabel,
            en: en.seo.twitter.titleLabel,
            es: es.seo.twitter.titleLabel,
            de: de.seo.twitter.titleLabel,
            pl: pl.seo.twitter.titleLabel,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.twitter.titleDescription,
              en: en.seo.twitter.titleDescription,
              es: es.seo.twitter.titleDescription,
              de: de.seo.twitter.titleDescription,
              pl: pl.seo.twitter.titleDescription,
            },
            placeholder: {
              nl: nl.seo.twitter.titlePlaceholder,
              en: en.seo.twitter.titlePlaceholder,
              es: es.seo.twitter.titlePlaceholder,
              de: de.seo.twitter.titlePlaceholder,
              pl: pl.seo.twitter.titlePlaceholder,
            },
          },
          maxLength: 70,
        },
        {
          name: 'twitterDescription',
          type: 'textarea',
          label: {
            nl: nl.seo.twitter.descriptionLabel,
            en: en.seo.twitter.descriptionLabel,
            es: es.seo.twitter.descriptionLabel,
            de: de.seo.twitter.descriptionLabel,
            pl: pl.seo.twitter.descriptionLabel,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.twitter.descriptionDescription,
              en: en.seo.twitter.descriptionDescription,
              es: es.seo.twitter.descriptionDescription,
              de: de.seo.twitter.descriptionDescription,
              pl: pl.seo.twitter.descriptionDescription,
            },
            placeholder: {
              nl: nl.seo.twitter.descriptionPlaceholder,
              en: en.seo.twitter.descriptionPlaceholder,
              es: es.seo.twitter.descriptionPlaceholder,
              de: de.seo.twitter.descriptionPlaceholder,
              pl: pl.seo.twitter.descriptionPlaceholder,
            },
          },
          maxLength: 200,
        },
        {
          name: 'twitterImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            nl: nl.seo.twitter.imageLabel,
            en: en.seo.twitter.imageLabel,
            es: es.seo.twitter.imageLabel,
            de: de.seo.twitter.imageLabel,
            pl: pl.seo.twitter.imageLabel,
          },
          admin: {
            description: {
              nl: nl.seo.twitter.imageDescription,
              en: en.seo.twitter.imageDescription,
              es: es.seo.twitter.imageDescription,
              de: de.seo.twitter.imageDescription,
              pl: pl.seo.twitter.imageDescription,
            },
          },
        },
        {
          name: 'twitterCard',
          type: 'select',
          label: {
            nl: nl.seo.twitter.cardTypeLabel,
            en: en.seo.twitter.cardTypeLabel,
            es: es.seo.twitter.cardTypeLabel,
            de: de.seo.twitter.cardTypeLabel,
            pl: pl.seo.twitter.cardTypeLabel,
          },
          defaultValue: 'summary_large_image',
          options: [
            {
              label: {
                nl: nl.seo.twitter.cardTypeLargeImage,
                en: en.seo.twitter.cardTypeLargeImage,
                es: es.seo.twitter.cardTypeLargeImage,
                de: de.seo.twitter.cardTypeLargeImage,
                pl: pl.seo.twitter.cardTypeLargeImage,
              },
              value: 'summary_large_image',
            },
            {
              label: {
                nl: nl.seo.twitter.cardTypeSummary,
                en: en.seo.twitter.cardTypeSummary,
                es: es.seo.twitter.cardTypeSummary,
                de: de.seo.twitter.cardTypeSummary,
                pl: pl.seo.twitter.cardTypeSummary,
              },
              value: 'summary',
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: {
        nl: nl.seo.whatsapp.collapsibleLabel,
        en: en.seo.whatsapp.collapsibleLabel,
        es: es.seo.whatsapp.collapsibleLabel,
        de: de.seo.whatsapp.collapsibleLabel,
        pl: pl.seo.whatsapp.collapsibleLabel,
      },
      admin: {
        initCollapsed: true,
        description: {
          nl: nl.seo.whatsapp.collapsibleDescription,
          en: en.seo.whatsapp.collapsibleDescription,
          es: es.seo.whatsapp.collapsibleDescription,
          de: de.seo.whatsapp.collapsibleDescription,
          pl: pl.seo.whatsapp.collapsibleDescription,
        },
      },
      fields: [
        {
          name: 'whatsappTitle',
          type: 'text',
          label: {
            nl: nl.seo.whatsapp.titleLabel,
            en: en.seo.whatsapp.titleLabel,
            es: es.seo.whatsapp.titleLabel,
            de: de.seo.whatsapp.titleLabel,
            pl: pl.seo.whatsapp.titleLabel,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.whatsapp.titleDescription,
              en: en.seo.whatsapp.titleDescription,
              es: es.seo.whatsapp.titleDescription,
              de: de.seo.whatsapp.titleDescription,
              pl: pl.seo.whatsapp.titleDescription,
            },
            placeholder: {
              nl: nl.seo.whatsapp.titlePlaceholder,
              en: en.seo.whatsapp.titlePlaceholder,
              es: es.seo.whatsapp.titlePlaceholder,
              de: de.seo.whatsapp.titlePlaceholder,
              pl: pl.seo.whatsapp.titlePlaceholder,
            },
          },
          maxLength: 70,
        },
        {
          name: 'whatsappDescription',
          type: 'textarea',
          label: {
            nl: nl.seo.whatsapp.descriptionLabel,
            en: en.seo.whatsapp.descriptionLabel,
            es: es.seo.whatsapp.descriptionLabel,
            de: de.seo.whatsapp.descriptionLabel,
            pl: pl.seo.whatsapp.descriptionLabel,
          },
          localized: true,
          admin: {
            description: {
              nl: nl.seo.whatsapp.descriptionDescription,
              en: en.seo.whatsapp.descriptionDescription,
              es: es.seo.whatsapp.descriptionDescription,
              de: de.seo.whatsapp.descriptionDescription,
              pl: pl.seo.whatsapp.descriptionDescription,
            },
            placeholder: {
              nl: nl.seo.whatsapp.descriptionPlaceholder,
              en: en.seo.whatsapp.descriptionPlaceholder,
              es: es.seo.whatsapp.descriptionPlaceholder,
              de: de.seo.whatsapp.descriptionPlaceholder,
              pl: pl.seo.whatsapp.descriptionPlaceholder,
            },
          },
          maxLength: 200,
        },
      ],
    },
    {
      type: 'collapsible',
      label: {
        nl: nl.seo.advanced.collapsibleLabel,
        en: en.seo.advanced.collapsibleLabel,
        es: es.seo.advanced.collapsibleLabel,
        de: de.seo.advanced.collapsibleLabel,
        pl: pl.seo.advanced.collapsibleLabel,
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'canonicalUrl',
          type: 'text',
          label: {
            nl: nl.seo.advanced.canonicalUrlLabel,
            en: en.seo.advanced.canonicalUrlLabel,
            es: es.seo.advanced.canonicalUrlLabel,
            de: de.seo.advanced.canonicalUrlLabel,
            pl: pl.seo.advanced.canonicalUrlLabel,
          },
          admin: {
            description: {
              nl: nl.seo.advanced.canonicalUrlDescription,
              en: en.seo.advanced.canonicalUrlDescription,
              es: es.seo.advanced.canonicalUrlDescription,
              de: de.seo.advanced.canonicalUrlDescription,
              pl: pl.seo.advanced.canonicalUrlDescription,
            },
            placeholder: {
              nl: nl.seo.advanced.canonicalUrlPlaceholder,
              en: en.seo.advanced.canonicalUrlPlaceholder,
              es: es.seo.advanced.canonicalUrlPlaceholder,
              de: de.seo.advanced.canonicalUrlPlaceholder,
              pl: pl.seo.advanced.canonicalUrlPlaceholder,
            },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'noIndex',
              type: 'checkbox',
              label: {
                nl: nl.seo.advanced.noIndexLabel,
                en: en.seo.advanced.noIndexLabel,
                es: es.seo.advanced.noIndexLabel,
                de: de.seo.advanced.noIndexLabel,
                pl: pl.seo.advanced.noIndexLabel,
              },
              defaultValue: false,
              admin: {
                description: {
                  nl: nl.seo.advanced.noIndexDescription,
                  en: en.seo.advanced.noIndexDescription,
                  es: es.seo.advanced.noIndexDescription,
                  de: de.seo.advanced.noIndexDescription,
                  pl: pl.seo.advanced.noIndexDescription,
                },
              },
            },
            {
              name: 'noFollow',
              type: 'checkbox',
              label: {
                nl: nl.seo.advanced.noFollowLabel,
                en: en.seo.advanced.noFollowLabel,
                es: es.seo.advanced.noFollowLabel,
                de: de.seo.advanced.noFollowLabel,
                pl: pl.seo.advanced.noFollowLabel,
              },
              defaultValue: false,
              admin: {
                description: {
                  nl: nl.seo.advanced.noFollowDescription,
                  en: en.seo.advanced.noFollowDescription,
                  es: es.seo.advanced.noFollowDescription,
                  de: de.seo.advanced.noFollowDescription,
                  pl: pl.seo.advanced.noFollowDescription,
                },
              },
            },
          ],
        },
        {
          name: 'hideFromSitemap',
          type: 'checkbox',
          label: {
            nl: nl.seo.advanced.hideFromSitemapLabel,
            en: en.seo.advanced.hideFromSitemapLabel,
            es: es.seo.advanced.hideFromSitemapLabel,
            de: de.seo.advanced.hideFromSitemapLabel,
            pl: pl.seo.advanced.hideFromSitemapLabel,
          },
          defaultValue: false,
          admin: {
            description: {
              nl: nl.seo.advanced.hideFromSitemapDescription,
              en: en.seo.advanced.hideFromSitemapDescription,
              es: es.seo.advanced.hideFromSitemapDescription,
              de: de.seo.advanced.hideFromSitemapDescription,
              pl: pl.seo.advanced.hideFromSitemapDescription,
            },
          },
        },
      ],
    },
    {
      type: 'ui',
      name: 'seoPreview',
      admin: {
        components: {
          Field: '@/components/admin/SEOPreview#SEOPreview',
        },
      },
    },
  ],
}
