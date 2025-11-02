// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Pages } from './collections/Pages'
import { SiteSettings } from './collections/SiteSettings'
import { Navigation } from './collections/Navigation'
import { Footer } from './collections/Footer'
import { Blog } from './collections/Blog'
import { Home } from './globals/Home'
import { Contact } from './globals/Contact'

// Import Payload's built-in translations
import { en } from '@payloadcms/translations/languages/en'
import { nl } from '@payloadcms/translations/languages/nl'
import { es } from '@payloadcms/translations/languages/es'
import { de } from '@payloadcms/translations/languages/de'
import { pl } from '@payloadcms/translations/languages/pl'

// Import our custom translations (for SEO fields, etc.)
import { payloadTranslations } from './translations/payloadI18n'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: {
      en: en,
      nl: nl,
      es: es,
      de: de,
      pl: pl,
    },
    fallbackLanguage: 'en',
    translations: payloadTranslations,
  },
  collections: [Tenants, Users, Media, Pages, SiteSettings, Navigation, Footer, Blog],
  globals: [Home, Contact],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  localization: {
    locales: [
      {
        code: 'nl',
        label: 'Nederlands',
      },
      {
        code: 'en',
        label: 'English',
      },
      {
        code: 'es',
        label: 'Español',
      },
      {
        code: 'de',
        label: 'Deutsch',
      },
      {
        code: 'pl',
        label: 'Polski',
      },
    ],
    defaultLocale: 'nl',
    fallback: true,
  },
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
