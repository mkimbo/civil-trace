export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  WARDEN: 'warden',
  USER: 'user',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
