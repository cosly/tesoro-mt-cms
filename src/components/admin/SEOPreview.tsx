'use client'
import React from 'react'
import { useFormFields, useLocale } from '@payloadcms/ui'

/**
 * SEO Preview Component
 * Shows live previews of how the page will appear in:
 * - Google Search Results
 * - Facebook Share
 * - X.com (Twitter) Card
 * - WhatsApp Share
 */
export const SEOPreview: React.FC = () => {
  const locale = useLocale()
  const localeCode = locale?.code || 'nl'

  // Get form field values
  const title = useFormFields(([fields]) => {
    const titleField = fields?.title
    if (!titleField) return null
    return typeof titleField.value === 'string'
      ? titleField.value
      : titleField.value?.[localeCode] || null
  })

  const seoTitle = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.title) return null
    return typeof seo.title === 'string' ? seo.title : seo.title?.[localeCode] || null
  })

  const seoDescription = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.description) return null
    return typeof seo.description === 'string'
      ? seo.description
      : seo.description?.[localeCode] || null
  })

  const ogTitle = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.ogTitle) return null
    return typeof seo.ogTitle === 'string' ? seo.ogTitle : seo.ogTitle?.[localeCode] || null
  })

  const ogDescription = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.ogDescription) return null
    return typeof seo.ogDescription === 'string'
      ? seo.ogDescription
      : seo.ogDescription?.[localeCode] || null
  })

  const twitterTitle = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.twitterTitle) return null
    return typeof seo.twitterTitle === 'string'
      ? seo.twitterTitle
      : seo.twitterTitle?.[localeCode] || null
  })

  const twitterDescription = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.twitterDescription) return null
    return typeof seo.twitterDescription === 'string'
      ? seo.twitterDescription
      : seo.twitterDescription?.[localeCode] || null
  })

  const whatsappTitle = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.whatsappTitle) return null
    return typeof seo.whatsappTitle === 'string'
      ? seo.whatsappTitle
      : seo.whatsappTitle?.[localeCode] || null
  })

  const whatsappDescription = useFormFields(([fields]) => {
    const seo = fields?.seo?.value as any
    if (!seo?.whatsappDescription) return null
    return typeof seo.whatsappDescription === 'string'
      ? seo.whatsappDescription
      : seo.whatsappDescription?.[localeCode] || null
  })

  // Fallback logic
  const displayTitle = title || 'Pagina Titel'
  const googleTitle = seoTitle || displayTitle
  const googleDesc = seoDescription || 'Pagina omschrijving...'
  const fbTitle = ogTitle || seoTitle || displayTitle
  const fbDesc = ogDescription || seoDescription || 'Pagina omschrijving...'
  const xTitle = twitterTitle || seoTitle || displayTitle
  const xDesc = twitterDescription || seoDescription || 'Pagina omschrijving...'
  const waTitle = whatsappTitle || seoTitle || displayTitle
  const waDesc = whatsappDescription || seoDescription || 'Pagina omschrijving...'

  // Truncate helper
  const truncate = (str: string, max: number) => {
    if (str.length <= max) return str
    return str.substring(0, max) + '...'
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fafafa',
        borderRadius: '4px',
        fontSize: '13px',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
        }}
      >
        SEO Preview
      </h3>

      {/* Google Search Preview */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Google Search
        </div>
        <div
          style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              color: '#1a0dab',
              fontSize: '18px',
              lineHeight: '1.3',
              marginBottom: '4px',
              fontWeight: 400,
            }}
          >
            {truncate(googleTitle, 60)}
          </div>
          <div
            style={{
              color: '#006621',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            https://example.com
          </div>
          <div
            style={{
              color: '#545454',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            {truncate(googleDesc, 160)}
          </div>
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#666',
            marginTop: '4px',
          }}
        >
          {googleTitle.length}/60 characters
          {googleTitle.length > 60 && (
            <span style={{ color: '#d93025', marginLeft: '4px' }}>Te lang</span>
          )}
        </div>
      </div>

      {/* Facebook Preview */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Facebook
        </div>
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              backgroundColor: '#e9ebee',
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '12px',
            }}
          >
            1200 x 630px
          </div>
          <div style={{ padding: '12px', backgroundColor: '#f2f3f5' }}>
            <div
              style={{
                fontSize: '12px',
                color: '#606770',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}
            >
              EXAMPLE.COM
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1c1e21',
                marginBottom: '4px',
                lineHeight: '1.3',
              }}
            >
              {truncate(fbTitle, 70)}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#606770',
                lineHeight: '1.4',
              }}
            >
              {truncate(fbDesc, 200)}
            </div>
          </div>
        </div>
      </div>

      {/* X.com (Twitter) Preview */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          X.com (Twitter)
        </div>
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              backgroundColor: '#e9ebee',
              height: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '12px',
            }}
          >
            1200 x 675px
          </div>
          <div style={{ padding: '12px' }}>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f1419',
                marginBottom: '2px',
                lineHeight: '1.3',
              }}
            >
              {truncate(xTitle, 70)}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#536471',
                lineHeight: '1.4',
                marginBottom: '4px',
              }}
            >
              {truncate(xDesc, 200)}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#536471',
              }}
            >
              example.com
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Preview */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          WhatsApp
        </div>
        <div
          style={{
            backgroundColor: '#dcf8c6',
            padding: '8px 10px',
            borderRadius: '8px',
            position: 'relative',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#000',
                marginBottom: '4px',
                lineHeight: '1.3',
              }}
            >
              {truncate(waTitle, 70)}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#667781',
                lineHeight: '1.4',
              }}
            >
              {truncate(waDesc, 200)}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#667781',
                marginTop: '4px',
              }}
            >
              example.com
            </div>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#667781',
              marginTop: '4px',
              textAlign: 'right',
            }}
          >
            12:34
          </div>
        </div>
      </div>
    </div>
  )
}
