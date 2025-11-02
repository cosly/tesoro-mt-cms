'use client'

/**
 * Custom RowLabel component for Navigation Menu Items
 */
export const MenuItemRowLabel = ({ data }: any) => {
  const label = data?.label
  const type = data?.type || 'page' // Default to page
  const page = data?.page
  const url = data?.url

  // Determine emoji and type name
  let emoji = '📄'
  let typeName = 'Page'
  if (type === 'url') {
    emoji = '🔗'
    typeName = 'Link'
  } else if (type === 'group') {
    emoji = '📁'
    typeName = 'Dropdown'
  }

  // Priority 1: Use the label field if filled
  if (label) {
    return `${emoji} ${label}`
  }

  // Priority 2: For page type, try to use page title
  if (type === 'page' && page) {
    const pageTitle = typeof page === 'object' ? page.title : null
    if (pageTitle) {
      return `${emoji} ${pageTitle}`
    }
  }

  // Priority 3: For URL type, show the URL
  if (type === 'url' && url) {
    const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url
    return `${emoji} ${displayUrl}`
  }

  // Priority 4: Show placeholder based on type
  return `${emoji} (Empty ${typeName})`
}

/**
 * Custom RowLabel component for Navigation Dropdown Items
 */
export const DropdownItemRowLabel = ({ data }: any) => {
  const label = data?.label
  const type = data?.type || 'page' // Default to page
  const page = data?.page
  const url = data?.url

  const emoji = type === 'url' ? '🔗' : '📄'
  const typeName = type === 'url' ? 'Link' : 'Page'

  // Priority 1: Use the label field if filled
  if (label) {
    return `${emoji} ${label}`
  }

  // Priority 2: For page type, try to use page title
  if (type === 'page' && page) {
    const pageTitle = typeof page === 'object' ? page.title : null
    if (pageTitle) {
      return `${emoji} ${pageTitle}`
    }
  }

  // Priority 3: For URL type, show the URL
  if (type === 'url' && url) {
    const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url
    return `${emoji} ${displayUrl}`
  }

  // Priority 4: Show placeholder based on type
  return `${emoji} (Empty ${typeName})`
}

/**
 * Custom RowLabel component for Footer Links
 */
export const FooterLinkRowLabel = ({ data, index }: any) => {
  const label = data?.label || `Link ${(index ?? 0) + 1}`
  const type = data?.type

  const typeLabel = type === 'page' ? '📄' : '🔗'

  return `${typeLabel} ${label}`
}

/**
 * Custom RowLabel component for Legal Links in Footer Bottom Bar
 */
export const LegalLinkRowLabel = ({ data, index }: any) => {
  const label = data?.label || `Legal Link ${(index ?? 0) + 1}`

  return `⚖️ ${label}`
}

/**
 * Custom RowLabel component for Page Button Links
 */
export const ButtonRowLabel = ({ data, index }: any) => {
  const text = data?.text || `Button ${(index ?? 0) + 1}`
  const variant = data?.variant

  let variantEmoji = '🔘'
  if (variant === 'primary') variantEmoji = '🔵'
  else if (variant === 'secondary') variantEmoji = '⚪'
  else if (variant === 'outline') variantEmoji = '⭕'

  return `${variantEmoji} ${text}`
}

/**
 * Custom RowLabel component for Image items
 */
export const ImageRowLabel = ({ data, index }: any) => {
  const alt = data?.alt || data?.caption || `Image ${(index ?? 0) + 1}`

  return `🖼️ ${alt}`
}

/**
 * Custom RowLabel component for Testimonial items
 */
export const TestimonialRowLabel = ({ data, index }: any) => {
  const name = data?.name || `Testimonial ${(index ?? 0) + 1}`
  const rating = data?.rating ? `⭐ ${data.rating}` : ''

  return `💬 ${name} ${rating}`
}
