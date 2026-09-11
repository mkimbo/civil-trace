import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { authenticated } from '@/access/authenticated'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'performedBy', 'entity', 'createdAt'],
  },
  access: {
    read: isSuperAdmin,
    create: authenticated,
    update: () => false,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'performedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'entity',
      type: 'text',
    },
    {
      name: 'entityId',
      type: 'text',
    },
    {
      name: 'details',
      type: 'json',
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
  ],
  timestamps: true,
}
