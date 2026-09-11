import type { CollectionConfig } from 'payload'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { authenticated } from '@/access/authenticated'
import { isModeratorOrAbove } from '@/access/isModeratorOrAbove'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const Sightings: CollectionConfig = {
  slug: 'sightings',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['alert', 'reporter', 'verificationStatus', 'locationName', 'createdAt'],
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: isModeratorOrAbove,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'alert',
      type: 'relationship',
      relationTo: 'alerts',
      required: true,
      index: true,
    },
    {
      name: 'reporter',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'location',
      type: 'point',
      required: true,
    },
    {
      name: 'locationName',
      type: 'text',
      label: 'Location / Landmark Description',
    },
    {
      name: 'sightingDate',
      type: 'date',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'verificationStatus',
      type: 'select',
      options: [
        { label: 'Pending Verification', value: 'pending' },
        { label: 'Verified Sighting', value: 'verified' },
        { label: 'Rejected / Inconclusive', value: 'rejected' },
        { label: 'Led to Safe Recovery', value: 'led-to-recovery' },
      ],
      defaultValue: 'pending',
      index: true,
    },
    {
      name: 'verifiedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'verifiedAt',
      type: 'date',
    },
  ],
  timestamps: true,
}
