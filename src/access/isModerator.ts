import type { Access } from 'payload'
import { ROLES } from '@/constants/roles'

export const isModerator: Access = ({ req: { user } }) => {
  return Boolean(user && Array.isArray((user as any).roles) && (user as any).roles.includes(ROLES.MODERATOR))
}
