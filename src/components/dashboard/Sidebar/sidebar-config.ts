import { ROLES } from '@/constants/roles'
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  FilePlus,
  PhoneCall,
  ShieldCheck,
  Eye,
  Award,
  History,
  Users,
  Settings,
  LucideIcon,
} from 'lucide-react'

export interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  roles: (keyof typeof ROLES)[]
  tKey?: string
}

export interface NavSection {
  label: string
  links: NavLink[]
}

export const sidebarSections: NavSection[] = [
  {
    label: 'Community Watch',
    links: [
      {
        href: '/dashboard',
        label: 'Dashboard Overview',
        icon: LayoutDashboard,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/map',
        label: 'Live Incident Map',
        icon: MapPin,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/alerts',
        label: 'Active Alerts',
        icon: AlertTriangle,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/create-alert',
        label: 'Submit Alert',
        icon: FilePlus,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/directory',
        label: 'Police & OCS Directory',
        icon: PhoneCall,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
    ],
  },
  {
    label: 'Verification & Triage',
    links: [
      {
        href: '/dashboard/triage',
        label: 'Forensic Triage Queue',
        icon: ShieldCheck,
        roles: ['MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/sightings',
        label: 'Reported Sightings',
        icon: Eye,
        roles: ['WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
    ],
  },
  {
    label: 'Trust & Verification',
    links: [
      {
        href: '/dashboard/points',
        label: 'Trust Score & Records',
        icon: Award,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/my-activity',
        label: 'My Reports & History',
        icon: History,
        roles: ['USER', 'WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
      {
        href: '/dashboard/wardens',
        label: 'Warden Network',
        icon: Users,
        roles: ['WARDEN', 'MODERATOR', 'EDITOR', 'SUPER_ADMIN'],
      },
    ],
  },
  {
    label: 'Administration',
    links: [
      {
        href: '/admin',
        label: 'Payload Admin Panel',
        icon: Settings,
        roles: ['SUPER_ADMIN'],
      },
    ],
  },
]