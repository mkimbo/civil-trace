import type { Access } from 'payload'
import { ROLES } from '@/constants/roles'

export const isModeratorOrAbove: Access = ({ req: { user } }) => {
  if (!user || !Array.isArray((user as any).roles)) return false
  const roles = (user as any).roles
  return (
    roles.includes(ROLES.SUPER_ADMIN) ||
    roles.includes(ROLES.MODERATOR) ||
    roles.includes(ROLES.EDITOR)
  )
}
