import type { Access } from 'payload'
import { ROLES } from '@/constants/roles'

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (Array.isArray((user as any).roles) && (user as any).roles.includes(ROLES.SUPER_ADMIN)) {
    return true
  }
  return {
    id: {
      equals: user.id,
    },
  }
}
