import type { CollectionConfig } from 'payload'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { authenticated } from '@/access/authenticated'
import { isModeratorOrAbove } from '@/access/isModeratorOrAbove'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { ALERT_CATEGORIES } from '@/constants/alert-categories'

export const Alerts: CollectionConfig = {
  slug: 'alerts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'obNumber', '_status', 'parityScore', 'createdAt'],
  },
  versions: {
    drafts: {
      autosave: false,
      validate: false,
    },
    maxPerDoc: 10,
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: isModeratorOrAbove,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Missing Person', value: ALERT_CATEGORIES.MISSING_PERSON },
        { label: 'Lost Vehicle', value: ALERT_CATEGORIES.LOST_VEHICLE },
        { label: 'Lost Motorbike', value: ALERT_CATEGORIES.LOST_MOTORBIKE },
      ],
      index: true,
    },
    {
      name: 'obNumber',
      type: 'text',
      required: true,
      label: 'Police OB Number',
      index: true,
    },
    {
      name: 'policeStation',
      type: 'text',
      required: true,
      label: 'Reporting Police Station',
    },
    {
      name: 'socialMediaURL',
      type: 'text',
      required: true,
      label: 'Social Media Post URL (FB / X / etc.)',
    },
    {
      name: 'socialMediaValid',
      type: 'checkbox',
      defaultValue: true,
      label: 'Social Media Post Verified Active',
    },
    {
      name: 'parityScore',
      type: 'number',
      min: 0,
      max: 100,
      label: 'AI Verification Parity Score (%)',
    },
    {
      name: 'parityReasoning',
      type: 'textarea',
      label: 'AI Parity Verification Reasoning',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'additionalPhotos',
      type: 'array',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'lastSeenLocation',
      type: 'point',
      label: 'Last Known Location (Coordinates)',
    },
    {
      name: 'lastSeenLocationName',
      type: 'text',
      label: 'Last Known Area / Landmark',
    },
    {
      name: 'lastSeenDate',
      type: 'date',
    },
    {
      name: 'alertRadius',
      type: 'number',
      defaultValue: 5000,
      label: 'Broadcast Push Radius (Meters)',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Emergency Family/Owner Contact Phone',
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'vehicleDetails',
      type: 'group',
      label: 'Vehicle / Motorbike Specifics',
      admin: {
        condition: (data) => data?.category !== ALERT_CATEGORIES.MISSING_PERSON,
      },
      fields: [
        {
          name: 'registrationNumber',
          type: 'text',
          label: 'Plate / Registration Number',
        },
        {
          name: 'make',
          type: 'text',
          label: 'Make / Manufacturer (e.g. Toyota, Boxer)',
        },
        {
          name: 'model',
          type: 'text',
          label: 'Model (e.g. Fielder, Boxer 150)',
        },
        {
          name: 'color',
          type: 'text',
        },
        {
          name: 'yearOfManufacture',
          type: 'number',
        },
      ],
    },
    {
      name: 'personDetails',
      type: 'group',
      label: 'Missing Person Specifics',
      admin: {
        condition: (data) => data?.category === ALERT_CATEGORIES.MISSING_PERSON,
      },
      fields: [
        {
          name: 'fullName',
          type: 'text',
        },
        {
          name: 'age',
          type: 'number',
        },
        {
          name: 'gender',
          type: 'select',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'height',
          type: 'text',
          label: 'Estimated Height',
        },
        {
          name: 'clothingLastSeen',
          type: 'textarea',
          label: 'Clothing Description',
        },
      ],
    },
    {
      name: 'isPaidBroadcast',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'broadcastTransaction',
      type: 'relationship',
      relationTo: 'transactions',
    },
  ],
  timestamps: true,
}
