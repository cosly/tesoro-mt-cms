# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Payload CMS 3.x** project built on Next.js 15 with TypeScript. It uses MongoDB as the database (via Mongoose adapter) and includes both a headless CMS admin panel and a frontend application.

## Development Commands

### Setup
```bash
pnpm install                      # Install dependencies
cp .env.example .env             # Setup environment variables
```

Required environment variables:
- `DATABASE_URI` - MongoDB connection string (e.g., `mongodb://127.0.0.1/your-database-name`)
- `PAYLOAD_SECRET` - Secret key for Payload CMS (generate a secure random string)

### Development
```bash
pnpm dev                         # Start development server (localhost:3000)
pnpm devsafe                     # Clean .next directory and start dev server
```

### Build & Production
```bash
pnpm build                       # Build for production
pnpm start                       # Start production server
```

### Code Quality
```bash
pnpm lint                        # Run ESLint
```

### Testing
```bash
pnpm test                        # Run all tests (integration + e2e)
pnpm test:int                    # Run Vitest integration tests only
pnpm test:e2e                    # Run Playwright e2e tests only
```

Integration tests are located in `tests/int/**/*.int.spec.ts` and run with Vitest.
E2E tests are located in `tests/e2e/**/*.e2e.spec.ts` and run with Playwright.

### Payload Commands
```bash
pnpm generate:types              # Generate TypeScript types from Payload config
pnpm generate:importmap          # Generate import map for admin panel
pnpm payload                     # Access Payload CLI
```

## Architecture

### Directory Structure

```
src/
├── app/                         # Next.js App Router
│   ├── (frontend)/             # Frontend routes (public-facing)
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Frontend layout
│   │   └── styles.css          # Frontend styles
│   ├── (payload)/              # Payload admin routes
│   │   ├── admin/              # Admin panel
│   │   ├── api/                # API routes
│   │   │   ├── [...slug]/      # Catch-all REST API routes
│   │   │   ├── graphql/        # GraphQL API endpoint
│   │   │   └── graphql-playground/  # GraphQL playground
│   │   ├── layout.tsx          # Admin layout (auto-generated)
│   │   └── custom.scss         # Custom admin styles
│   └── my-route/               # Example custom route
├── collections/                 # Payload collections
│   ├── Users.ts                # Users collection (auth-enabled)
│   └── Media.ts                # Media/uploads collection
├── payload.config.ts           # Payload CMS configuration
└── payload-types.ts            # Auto-generated TypeScript types
```

### Key Concepts

**Next.js Route Groups**: The `(frontend)` and `(payload)` directories use Next.js route groups (parentheses) to organize routes without affecting the URL structure. This separates frontend pages from the Payload admin panel.

**Payload Collections**: Collections are defined in `src/collections/` and imported into `payload.config.ts`. Each collection is a TypeScript object that defines:
- Schema/fields
- Access control
- Hooks
- Admin UI configuration

**Type Generation**: The file `src/payload-types.ts` is auto-generated from your Payload config. Run `pnpm generate:types` after modifying collections or config. **Do not manually edit this file.**

**Import Map**: Payload uses an import map for the admin panel. After making significant changes to collections or admin components, run `pnpm generate:importmap`.

### Path Aliases

TypeScript is configured with path aliases:
- `@/*` maps to `src/*`
- `@payload-config` maps to `src/payload.config.ts`

### Database & Storage

- **Database**: MongoDB via `@payloadcms/db-mongodb` (Mongoose adapter)
- **Media Storage**: Files are uploaded via the `Media` collection (slug: `media`)
- **Image Processing**: Uses Sharp for image optimization

### Admin Panel

Access the admin panel at `/admin` (default route). The admin UI is served by Payload and integrated with Next.js through `src/app/(payload)/` routes.

Custom admin styles can be added to `src/app/(payload)/custom.scss`.

## Common Workflows

### Adding a New Collection

1. Create a new file in `src/collections/` (e.g., `Posts.ts`)
2. Define the collection config with fields, access control, etc.
3. Import and add to the `collections` array in `src/payload.config.ts`
4. Run `pnpm generate:types` to update TypeScript types
5. Restart the dev server

### Querying Data in Frontend

Frontend pages can use the Payload Local API:

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

const payload = await getPayload({ config: await config })
const posts = await payload.find({ collection: 'posts' })
```

See `src/app/(frontend)/page.tsx` for a working example.

### Working with Authentication

The `Users` collection is auth-enabled. To check current user in server components:

```typescript
import { headers as getHeaders } from 'next/headers.js'
const headers = await getHeaders()
const { user } = await payload.auth({ headers })
```

## Node & Package Manager

- **Node**: Requires Node.js ^18.20.2 or >=20.9.0
- **Package Manager**: Uses pnpm (requires ^9 or ^10)
- **Module System**: ES Modules (type: "module" in package.json)

## Build Configuration

The project uses custom webpack configuration in `next.config.mjs` to handle TypeScript extension aliases (`.ts`, `.tsx`, `.mts`, etc.). This is required for Payload CMS integration.

Memory is increased for builds (`--max-old-space-size=8000`) to handle large CMS builds.
