'use client'

import { useLocale, useRowLabel } from '@payloadcms/ui'

/**
 * Helper function to extract localized value
 */
const getLocalizedValue = (value: any, localeCode: string): string | null => {
  if (!value) return null

  // If it's already a string, return it
  if (typeof value === 'string') return value

  // If it's a localized object, get the value for the current locale
  if (typeof value === 'object' && localeCode in value) {
    return value[localeCode]
  }

  // Fallback to first available locale
  if (typeof value === 'object') {
    const firstValue = Object.values(value)[0]
    return typeof firstValue === 'string' ? firstValue : null
  }

  return null
}


/**
 * Custom RowLabel component for Navigation Menu Items
 */
export const MenuItemRowLabel = () => {
  const locale = useLocale()
  const localeCode = locale?.code || 'nl'

  // Use the official Payload 3.x hook to get row data
  const { data, rowNumber } = useRowLabel<{
    label?: string | Record<string, string>
    type?: 'page' | 'url' | 'group'
    page?: any
    url?: string
  }>()

  const label = getLocalizedValue(data?.label, localeCode)
  const type = data?.type || 'page'
  const page = data?.page
  const url = data?.url

  // Determine type name
  let typeName = 'Page'
  if (type === 'url') {
    typeName = 'Link'
  } else if (type === 'group') {
    typeName = 'Dropdown'
  }

  // Priority 1: Use the label field if filled
  if (label) {
    return label
  }

  // Priority 2: For page type, try to use page title
  if (type === 'page' && page) {
    const pageTitle = typeof page === 'object'
      ? getLocalizedValue(page.title, localeCode)
      : null
    if (pageTitle) {
      return pageTitle
    }
  }

  // Priority 3: For URL type, show the URL
  if (type === 'url' && url) {
    const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url
    return displayUrl
  }

  // Priority 4: Show placeholder based on type
  return `(Empty ${typeName})`
}

/**
 * Custom RowLabel component for Navigation Dropdown Items
 */
export const DropdownItemRowLabel = () => {
  const locale = useLocale()
  const localeCode = locale?.code || 'nl'

  const { data } = useRowLabel<{
    label?: string | Record<string, string>
    type?: 'page' | 'url'
    page?: any
    url?: string
  }>()

  const label = getLocalizedValue(data?.label, localeCode)
  const type = data?.type || 'page'
  const page = data?.page
  const url = data?.url

  const typeName = type === 'url' ? 'Link' : 'Page'

  // Priority 1: Use the label field if filled
  if (label) {
    return label
  }

  // Priority 2: For page type, try to use page title
  if (type === 'page' && page) {
    const pageTitle = typeof page === 'object'
      ? getLocalizedValue(page.title, localeCode)
      : null
    if (pageTitle) {
      return pageTitle
    }
  }

  // Priority 3: For URL type, show the URL
  if (type === 'url' && url) {
    const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url
    return displayUrl
  }

  // Priority 4: Show placeholder based on type
  return `(Empty ${typeName})`
}

/**
 * Custom RowLabel component for Footer Links
 */
export const FooterLinkRowLabel = () => {
  const locale = useLocale()
  const localeCode = locale?.code || 'nl'

  const { data, rowNumber } = useRowLabel<{
    label?: string | Record<string, string>
    type?: string
  }>()

  const label = getLocalizedValue(data?.label, localeCode) || `Link ${rowNumber + 1}`

  return label
}

/**
 * Custom RowLabel component for Legal Links in Footer Bottom Bar
 */
export const LegalLinkRowLabel = () => {
  const locale = useLocale()
  const localeCode = locale?.code || 'nl'

  const { data, rowNumber } = useRowLabel<{
    label?: string | Record<string, string>
  }>()

  const label = getLocalizedValue(data?.label, localeCode) || `Legal Link ${rowNumber + 1}`

  return label
}

/**
 * Custom RowLabel component for Page Button Links
 */
export const ButtonRowLabel = () => {
  const locale = useLocale()
  const localeCode = locale?.code || 'nl'

  const { data, rowNumber } = useRowLabel<{
    text?: string | Record<string, string>
    variant?: string
  }>()

  const text = getLocalizedValue(data?.text, localeCode) || `Button ${rowNumber + 1}`

  return text
}

/**
 * Custom RowLabel component for Image items
 */
export const ImageRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{
    alt?: string
    caption?: string
  }>()

  const alt = data?.alt || data?.caption || `Image ${rowNumber + 1}`

  return alt
}

/**
 * Custom RowLabel component for Testimonial items
 */
export const TestimonialRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{
    name?: string
    rating?: number
  }>()

  const name = data?.name || `Testimonial ${rowNumber + 1}`
  const rating = data?.rating ? ` (${data.rating}★)` : ''

  return `${name}${rating}`
}
