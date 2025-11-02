/**
 * Translation System
 *
 * Exports all translations for the 5 supported languages.
 * Used for custom field labels, descriptions, and placeholders in Payload CMS.
 */

import { nl } from './nl'
import { en } from './en'
import { es } from './es'
import { de } from './de'
import { pl } from './pl'

export type TranslationKey = 'nl' | 'en' | 'es' | 'de' | 'pl'

export const translations = {
  nl,
  en,
  es,
  de,
  pl,
}

/**
 * Get translated string for a specific locale
 * Used in Payload field configurations
 *
 * @example
 * {
 *   label: ({ locale }) => t(locale, (t) => t.seo.metaTitle.label),
 *   description: ({ locale }) => t(locale, (t) => t.seo.metaTitle.description),
 * }
 */
export function t<T>(
  locale: string | undefined,
  selector: (translations: typeof nl) => T,
): T {
  const localeKey = (locale || 'nl') as TranslationKey
  const translation = translations[localeKey] || translations.nl
  return selector(translation)
}
