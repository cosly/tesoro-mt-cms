import type { CollectionConfig } from 'payload'
import { tenantAdminOnly, tenantRead } from '@/access'

/**
 * Theme Settings Collection
 *
 * Per-tenant styling configuration:
 * - Theme template selection
 * - Brand colors (4 basic colors)
 * - Typography (2 fonts)
 * - Logo uploads
 * - Styling details
 */
export const ThemeSettings: CollectionConfig = {
  slug: 'theme-settings',
  admin: {
    useAsTitle: 'tenant',
    defaultColumns: ['tenant', 'template', 'updatedAt'],
    description: 'Customize your website styling and branding',
    group: 'Website',
  },
  access: {
    // Tenant users can read their theme settings
    read: tenantRead,
    // Only tenant admins can create/update theme settings
    create: tenantAdminOnly,
    update: tenantAdminOnly,
    // Only super admins can delete theme settings
    delete: ({ req: { user } }) => user?.isSuperAdmin === true,
  },
  hooks: {
    beforeChange: [
      // Auto-assign tenant on create
      ({ req, data, operation }) => {
        if (operation === 'create' && !data.tenant && req.user && !req.user.isSuperAdmin) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true, // One theme settings per tenant
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant these settings belong to',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    // Template Selection
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'modern',
      options: [
        {
          label: 'Modern & Clean',
          value: 'modern',
        },
        {
          label: 'Classic & Professional',
          value: 'classic',
        },
        {
          label: 'Minimal',
          value: 'minimal',
        },
        {
          label: 'Luxury & Premium',
          value: 'luxury',
        },
      ],
      admin: {
        description: 'Choose your website template style',
      },
    },
    // Brand Colors
    {
      name: 'colors',
      type: 'group',
      label: 'Brand Colors',
      fields: [
        {
          name: 'primary',
          type: 'text',
          required: true,
          defaultValue: '#1E40AF',
          admin: {
            description: 'Primary brand color (e.g., #1E40AF)',
            placeholder: '#1E40AF',
          },
          validate: (value) => {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
              return 'Must be a valid hex color (e.g., #1E40AF)'
            }
            return true
          },
        },
        {
          name: 'secondary',
          type: 'text',
          required: true,
          defaultValue: '#64748B',
          admin: {
            description: 'Secondary accent color (e.g., #64748B)',
            placeholder: '#64748B',
          },
          validate: (value) => {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
              return 'Must be a valid hex color (e.g., #64748B)'
            }
            return true
          },
        },
        {
          name: 'accent',
          type: 'text',
          required: true,
          defaultValue: '#F59E0B',
          admin: {
            description: 'Accent/highlight color (e.g., #F59E0B)',
            placeholder: '#F59E0B',
          },
          validate: (value) => {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
              return 'Must be a valid hex color (e.g., #F59E0B)'
            }
            return true
          },
        },
        {
          name: 'background',
          type: 'text',
          required: true,
          defaultValue: '#FFFFFF',
          admin: {
            description: 'Background color (e.g., #FFFFFF)',
            placeholder: '#FFFFFF',
          },
          validate: (value) => {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
              return 'Must be a valid hex color (e.g., #FFFFFF)'
            }
            return true
          },
        },
      ],
    },
    // Typography
    {
      name: 'typography',
      type: 'group',
      label: 'Typography',
      fields: [
        {
          name: 'headingFont',
          type: 'select',
          required: true,
          defaultValue: 'Montserrat',
          options: [
            { label: 'Montserrat', value: 'Montserrat' },
            { label: 'Playfair Display', value: 'Playfair Display' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Open Sans', value: 'Open Sans' },
            { label: 'Lato', value: 'Lato' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Inter', value: 'Inter' },
            { label: 'Raleway', value: 'Raleway' },
            { label: 'Merriweather', value: 'Merriweather' },
            { label: 'Oswald', value: 'Oswald' },
          ],
          admin: {
            description: 'Font for headings (H1, H2, H3, etc.)',
          },
        },
        {
          name: 'bodyFont',
          type: 'select',
          required: true,
          defaultValue: 'Open Sans',
          options: [
            { label: 'Open Sans', value: 'Open Sans' },
            { label: 'Lato', value: 'Lato' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Inter', value: 'Inter' },
            { label: 'Montserrat', value: 'Montserrat' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Source Sans Pro', value: 'Source Sans Pro' },
            { label: 'Nunito', value: 'Nunito' },
            { label: 'PT Sans', value: 'PT Sans' },
            { label: 'Work Sans', value: 'Work Sans' },
          ],
          admin: {
            description: 'Font for body text and paragraphs',
          },
        },
      ],
    },
    // Branding / Logos
    {
      name: 'branding',
      type: 'group',
      label: 'Branding & Logos',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Main logo (used in header)',
          },
        },
        {
          name: 'logoFooter',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Footer logo (optional, uses main logo if not set)',
          },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Favicon (16x16 or 32x32 .ico or .png)',
          },
        },
      ],
    },
    // Styling Details
    {
      name: 'styling',
      type: 'group',
      label: 'Styling Details',
      fields: [
        {
          name: 'borderRadius',
          type: 'number',
          required: true,
          defaultValue: 8,
          min: 0,
          max: 20,
          admin: {
            description: 'Border radius for buttons and cards (0-20px)',
            step: 1,
          },
        },
        {
          name: 'buttonStyle',
          type: 'select',
          required: true,
          defaultValue: 'rounded',
          options: [
            { label: 'Rounded', value: 'rounded' },
            { label: 'Square', value: 'square' },
            { label: 'Pill', value: 'pill' },
          ],
          admin: {
            description: 'Button shape style',
          },
        },
        {
          name: 'shadowIntensity',
          type: 'select',
          required: true,
          defaultValue: 'subtle',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Subtle', value: 'subtle' },
            { label: 'Medium', value: 'medium' },
            { label: 'Strong', value: 'strong' },
          ],
          admin: {
            description: 'Shadow intensity for cards and elements',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
