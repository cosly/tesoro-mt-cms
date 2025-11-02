import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auto-Provisioning API Endpoint
 *
 * Called by Tesoro CRM when a new customer registers
 * Creates: Tenant, Theme Settings, Site Settings, Default Pages, Admin User
 *
 * POST /api/provision-tenant
 * Body: {
 *   crmTenantId: string,
 *   companyName: string,
 *   domain: string,
 *   adminEmail: string,
 *   adminPassword: string,
 *   contactInfo?: { ... }
 * }
 */

interface ProvisionRequest {
  crmTenantId: string
  companyName: string
  domain: string // subdomain (e.g., "janssen-makelaars")
  adminEmail: string
  adminPassword: string
  contactInfo?: {
    phone?: string
    address?: {
      street?: string
      city?: string
      postalCode?: string
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    // Parse request body
    const data: ProvisionRequest = await req.json()

    // Validate required fields
    if (
      !data.crmTenantId ||
      !data.companyName ||
      !data.domain ||
      !data.adminEmail ||
      !data.adminPassword
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if tenant already exists
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        domain: {
          equals: data.domain,
        },
      },
    })

    if (existingTenant.docs.length > 0) {
      return NextResponse.json(
        { error: 'Tenant with this domain already exists' },
        { status: 409 }
      )
    }

    // 1. Create Tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: data.companyName,
        domain: data.domain,
        status: 'active',
        settings: {
          maxUsers: 10,
          maxStorage: 5120, // 5GB
        },
        metadata: {
          contactEmail: data.adminEmail,
          contactName: data.companyName,
        },
      },
    })

    console.log(`[Provisioning] Created tenant: ${tenant.id}`)

    // 2. Create Admin User
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: data.adminEmail,
        password: data.adminPassword,
        tenant: tenant.id,
        role: 'admin',
        isSuperAdmin: false,
      },
    })

    console.log(`[Provisioning] Created admin user: ${adminUser.id}`)

    // 3. Create Default Theme Settings
    const themeSettings = await payload.create({
      collection: 'theme-settings',
      data: {
        tenant: tenant.id,
        template: 'modern',
        colors: {
          primary: '#1E40AF',
          secondary: '#64748B',
          accent: '#F59E0B',
          background: '#FFFFFF',
        },
        typography: {
          headingFont: 'Montserrat',
          bodyFont: 'Open Sans',
        },
        styling: {
          borderRadius: 8,
          buttonStyle: 'rounded',
          shadowIntensity: 'subtle',
        },
      },
    })

    console.log(`[Provisioning] Created theme settings: ${themeSettings.id}`)

    // 4. Create Default Site Settings
    const siteSettings = await payload.create({
      collection: 'site-settings',
      data: {
        tenant: tenant.id,
        features: {
          enableBlog: false,
          enableTestimonials: true,
          enableTeamPage: true,
          enableContactForm: true,
          enableNewsletter: false,
          enableSearch: true,
        },
        seo: {
          defaultTitle: data.companyName,
          defaultDescription: `Welkom bij ${data.companyName} - Uw partner in vastgoed`,
        },
        contact: {
          companyName: data.companyName,
          email: data.adminEmail,
          phone: data.contactInfo?.phone || '',
          address: {
            street: data.contactInfo?.address?.street || '',
            city: data.contactInfo?.address?.city || '',
            postalCode: data.contactInfo?.address?.postalCode || '',
            country: 'Nederland',
          },
        },
        additional: {
          maintenanceMode: false,
          cookieConsent: true,
        },
      },
    })

    console.log(`[Provisioning] Created site settings: ${siteSettings.id}`)

    // 5. Create Default Homepage
    const homepage = await payload.create({
      collection: 'pages',
      data: {
        tenant: tenant.id,
        title: 'Home',
        slug: 'home',
        blocks: [
          {
            blockType: 'hero',
            variant: 'image',
            title: `Welkom bij ${data.companyName}`,
            subtitle: 'Wij helpen u bij het vinden van uw droomhuis',
            height: 'large',
            buttons: [
              {
                text: 'Bekijk Aanbod',
                link: '/aanbod',
                style: 'primary',
              },
              {
                text: 'Contact',
                link: '/contact',
                style: 'outline',
              },
            ],
          },
          {
            blockType: 'propertyShowcase',
            title: 'Uitgelichte Woningen',
            subtitle: 'Bekijk onze nieuwste aanbiedingen',
            layout: 'grid',
            filter: {
              propertyType: 'all',
              featured: true,
              maxResults: 6,
            },
          },
          {
            blockType: 'textContent',
            columns: 1,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        version: 1,
                        text: `${data.companyName} is uw betrouwbare partner voor al uw vastgoedbehoeften.`,
                      },
                    ],
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        seo: {
          metaTitle: data.companyName,
          metaDescription: `Welkom bij ${data.companyName} - Uw partner in vastgoed`,
        },
        status: 'published',
      },
    })

    console.log(`[Provisioning] Created homepage: ${homepage.id}`)

    // 6. Create Contact Page
    const contactPage = await payload.create({
      collection: 'pages',
      data: {
        tenant: tenant.id,
        title: 'Contact',
        slug: 'contact',
        blocks: [
          {
            blockType: 'textContent',
            columns: 1,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    version: 1,
                    children: [{ type: 'text', version: 1, text: 'Neem Contact Op' }],
                    tag: 'h1',
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        version: 1,
                        text: 'Heeft u vragen? Neem gerust contact met ons op.',
                      },
                    ],
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
          {
            blockType: 'contactForm',
            title: 'Stuur ons een bericht',
            description: 'Vul het formulier in en wij nemen zo snel mogelijk contact met u op.',
            formFields: ['name', 'email', 'phone', 'message'],
            submitAction: 'crm-api',
          },
        ],
        seo: {
          metaTitle: `Contact - ${data.companyName}`,
          metaDescription: 'Neem contact op met ons team',
        },
        status: 'published',
      },
    })

    console.log(`[Provisioning] Created contact page: ${contactPage.id}`)

    // 7. Create About Page
    const aboutPage = await payload.create({
      collection: 'pages',
      data: {
        tenant: tenant.id,
        title: 'Over Ons',
        slug: 'over-ons',
        blocks: [
          {
            blockType: 'textContent',
            columns: 1,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    version: 1,
                    children: [{ type: 'text', version: 1, text: 'Over Ons' }],
                    tag: 'h1',
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        version: 1,
                        text: `${data.companyName} is een professioneel makelaarskantoor met jarenlange ervaring in de vastgoedmarkt.`,
                      },
                    ],
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
          {
            blockType: 'agentGrid',
            title: 'Ons Team',
            subtitle: 'Maak kennis met onze makelaars',
            columns: 3,
          },
        ],
        seo: {
          metaTitle: `Over Ons - ${data.companyName}`,
          metaDescription: 'Leer meer over ons team en onze aanpak',
        },
        status: 'published',
      },
    })

    console.log(`[Provisioning] Created about page: ${aboutPage.id}`)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Tenant provisioned successfully',
        data: {
          tenantId: tenant.id,
          domain: data.domain,
          websiteUrl: `https://${data.domain}.tesoro.nl`,
          adminLoginUrl: `https://${data.domain}.tesoro.nl/admin`,
          adminEmail: data.adminEmail,
          created: {
            tenant: tenant.id,
            adminUser: adminUser.id,
            themeSettings: themeSettings.id,
            siteSettings: siteSettings.id,
            pages: [homepage.id, contactPage.id, aboutPage.id],
          },
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Provisioning] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to provision tenant',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
