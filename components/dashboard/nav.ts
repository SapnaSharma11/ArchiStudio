import {
  LayoutDashboard, FolderKanban, Inbox, Users, UserRound, Images, Layers, Quote, Award,
  Image as ImageIcon, Compass, Newspaper, Mic, Film, PenTool, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = { label: string; href: string; icon: LucideIcon; title?: string }
export type NavSection = { section?: string; items: NavItem[] }

/** Single source for sidebar entries and topbar page titles. */
export const NAV: NavSection[] = [
  { items: [{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard, title: 'Studio Overview' }] },
  {
    section: 'Studio',
    items: [
      { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
      { label: 'Enquiries', href: '/dashboard/enquiries', icon: Inbox },
      { label: 'Clients', href: '/dashboard/clients', icon: Users },
      { label: 'Team', href: '/dashboard/team', icon: UserRound },
    ],
  },
  {
    section: 'Website',
    items: [
      { label: 'Portfolio', href: '/dashboard/portfolio', icon: Images },
      { label: 'Services', href: '/dashboard/services', icon: Layers },
      { label: 'Testimonials', href: '/dashboard/testimonials', icon: Quote, title: 'Client Stories' },
      { label: 'Awards', href: '/dashboard/awards', icon: Award, title: 'Awards & Recognition' },
      { label: 'Studio Archive', href: '/dashboard/gallery', icon: ImageIcon },
      { label: 'Design Principles', href: '/dashboard/principles', icon: Compass },
    ],
  },
  {
    section: 'Journal',
    items: [
      { label: 'News & Events', href: '/dashboard/news', icon: Newspaper },
      { label: 'Talks & Site Visits', href: '/dashboard/talks', icon: Mic },
      { label: 'Films', href: '/dashboard/films', icon: Film, title: 'Films & Walkthroughs' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { label: 'Principal Architect', href: '/dashboard/principal', icon: PenTool },
      { label: 'Studio Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

export function isActive(pathname: string, href: string): boolean {
  return href === '/dashboard' ? pathname === '/dashboard' : pathname === href || pathname.startsWith(`${href}/`)
}

export function titleFor(pathname: string): string {
  for (const s of NAV) for (const i of s.items) if (isActive(pathname, i.href)) return i.title ?? i.label
  return 'Dashboard'
}
