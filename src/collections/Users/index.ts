import type { CollectionConfig } from 'payload'
import { ROLES } from '@/constants/roles'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { adminOrSelf } from '@/access/adminOrSelf'
import { anyone } from '@/access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 30 * 24 * 60 * 60, // 30 days
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles', 'phoneNumber', 'county'],
  },
  access: {
    read: anyone,
    create: anyone,
    update: adminOrSelf,
    delete: isSuperAdmin,
    admin: ({ req: { user } }) => {
      if (!user) return false
      const roles = (user as any).roles || []
      return roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.MODERATOR) || roles.includes(ROLES.EDITOR)
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      saveToJWT: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'User', value: ROLES.USER },
        { label: 'Warden', value: ROLES.WARDEN },
        { label: 'Moderator', value: ROLES.MODERATOR },
        { label: 'Editor', value: ROLES.EDITOR },
        { label: 'Super Admin', value: ROLES.SUPER_ADMIN },
      ],
      defaultValue: [ROLES.USER],
      required: true,
      saveToJWT: true,
      access: {
        update: ({ req: { user } }) => {
          return Boolean(user && Array.isArray((user as any).roles) && (user as any).roles.includes(ROLES.SUPER_ADMIN))
        },
      },
    },
    {
      name: 'firebaseUID',
      type: 'text',
      unique: true,
      index: true,
      saveToJWT: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'phoneNumber',
      type: 'text',
      index: true,
      saveToJWT: true,
    },
    {
      name: 'phoneVerified',
      type: 'checkbox',
      defaultValue: false,
      saveToJWT: true,
    },
    {
      name: 'county',
      type: 'text',
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
      name: 'fcmTokens',
      type: 'json',
      defaultValue: [],
    },
    {
      name: 'civicPointsBalance',
      type: 'number',
      defaultValue: 0,
      saveToJWT: true,
    },
  ],
  timestamps: true,
}
