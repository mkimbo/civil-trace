import type { CollectionConfig } from 'payload'
import { adminOrSelf } from '@/access/adminOrSelf'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const CivicPointLedger: CollectionConfig = {
  slug: 'civic-point-ledger',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['user', 'action', 'points', 'createdAt'],
  },
  access: {
    read: adminOrSelf,
    create: isSuperAdmin,
    update: () => false, // Immutable ledger
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Alert Submitted', value: 'alert-submitted' },
        { label: 'Sighting Verified', value: 'sighting-verified' },
        { label: 'Poster Uploaded', value: 'poster-uploaded' },
        { label: 'Directory Verified', value: 'directory-verified' },
        { label: 'Alert Shared', value: 'alert-shared' },
        { label: 'Active Standby', value: 'active-standby' },
        { label: 'Points Redeemed', value: 'points-redeemed' },
        { label: 'Warden Promotion', value: 'warden-promotion' },
      ],
      index: true,
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      label: 'Points Amount (+ for award, - for redemption)',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'relatedAlert',
      type: 'relationship',
      relationTo: 'alerts',
    },
  ],
  timestamps: true,
}
