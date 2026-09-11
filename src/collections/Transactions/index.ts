import type { CollectionConfig } from 'payload'
import { adminOrSelf } from '@/access/adminOrSelf'
import { authenticated } from '@/access/authenticated'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'type', 'amount', 'phoneNumber', 'status', 'createdAt'],
  },
  access: {
    read: adminOrSelf,
    create: authenticated,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Lost Property Broadcast', value: 'lost-property-broadcast' },
        { label: 'Radius Extension', value: 'radius-extension' },
        { label: 'Civic Points Redemption', value: 'civic-points-redemption' },
      ],
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Amount (KES)',
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'KES',
    },
    {
      name: 'phoneNumber',
      type: 'text',
      label: 'M-PESA Phone Number',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      index: true,
    },
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Paystack Reference',
    },
    {
      name: 'paystackTransactionId',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'alert',
      type: 'relationship',
      relationTo: 'alerts',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  timestamps: true,
}
