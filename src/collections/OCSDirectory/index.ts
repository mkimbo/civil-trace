import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { isModeratorOrAbove } from '@/access/isModeratorOrAbove'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const OCSDirectory: CollectionConfig = {
  slug: 'ocs-directory',
  admin: {
    useAsTitle: 'stationName',
    defaultColumns: ['stationName', 'county', 'phoneNumber', 'ocsName', 'lastVerified', 'isActive'],
  },
  access: {
    read: anyone,
    create: isModeratorOrAbove,
    update: isModeratorOrAbove,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'stationName',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'ocsName',
      type: 'text',
      label: 'Officer In Charge (OCS) Name',
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      label: 'Primary Emergency Hotline / Desk Phone',
    },
    {
      name: 'alternatePhone',
      type: 'text',
    },
    {
      name: 'county',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'subCounty',
      type: 'text',
    },
    {
      name: 'ward',
      type: 'text',
    },
    {
      name: 'location',
      type: 'point',
    },
    {
      name: 'lastVerified',
      type: 'date',
    },
    {
      name: 'verifiedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
