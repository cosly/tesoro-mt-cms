import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: {
        en: 'First Name',
        nl: 'Voornaam',
        es: 'Nombre',
        de: 'Vorname',
        pl: 'Imię',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: {
        en: 'Last Name',
        nl: 'Achternaam',
        es: 'Apellido',
        de: 'Nachname',
        pl: 'Nazwisko',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      label: 'Super Admin',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
    },
  ],
}
