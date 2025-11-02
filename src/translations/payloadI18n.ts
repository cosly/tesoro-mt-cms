/**
 * Payload i18n Custom Translations
 *
 * This file exports only CUSTOM translations (SEO fields, etc.)
 * Built-in Payload admin UI translations are loaded via supportedLanguages in payload.config.ts
 */

// Import our custom translations
import { nl } from './nl'
import { en } from './en'
import { es } from './es'
import { de } from './de'
import { pl } from './pl'

/**
 * Flatten nested translation object to dot notation for Payload i18n
 */
function flattenTranslations(
  obj: Record<string, any>,
  prefix = 'custom',
): Record<string, string> {
  const result: Record<string, string> = {}

  function flatten(current: any, path: string) {
    for (const key in current) {
      const newPath = path ? `${path}.${key}` : key
      const value = current[key]

      if (typeof value === 'string') {
        result[`${prefix}:${newPath}`] = value
      } else if (typeof value === 'object' && value !== null) {
        flatten(value, newPath)
      }
    }
  }

  flatten(obj, '')
  return result
}

/**
 * Export custom translations for Payload admin i18n
 * These extend the built-in translations for our custom fields (SEO, etc.)
 */
export const payloadTranslations = {
  en: flattenTranslations(en),
  nl: flattenTranslations(nl),
  es: flattenTranslations(es),
  de: flattenTranslations(de),
  pl: flattenTranslations(pl),
}
