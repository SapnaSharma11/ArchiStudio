import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { StudioData } from '@/lib/clinic'
import { BRAND } from '@/lib/brand'
import { Wordmark } from '@/components/layout/Navbar'

const navigation = [
  { label: 'About Akash Sharma', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Our process', href: '/#process' },
  { label: 'Journal', href: '/journal' },
  { label: 'Project archive', href: '/gallery' },
  { label: 'Client stories', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
]

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  facebook: 'Facebook',
  youtube: 'YouTube',
  behance: 'Behance',
}

function hoursSummary(studio: StudioData): string[] {
  const open = studio.hours.filter((h) => !h.byAppointment && !h.closed && h.morningOpen)
  if (!open.length) return []
  const allDay = (h: (typeof open)[number]) => h.morningOpen === '00:00' && (h.morningClose ?? h.eveningClose) === '23:59'
  if (open.length === 7 && open.every(allDay)) return ['Open 24 hours, 7 days a week']
  const first = open[0]
  const weekdays = open.filter((h) => h.morningOpen === first.morningOpen && (h.eveningClose ?? h.morningClose) === (first.eveningClose ?? first.morningClose))
  const lines = [`${weekdays[0].day.slice(0, 3)} – ${weekdays[weekdays.length - 1].day.slice(0, 3)}  ·  ${first.morningOpen} – ${first.eveningClose ?? first.morningClose}`]
  for (const h of open.filter((x) => !weekdays.includes(x))) {
    lines.push(`${h.day.slice(0, 3)}  ·  ${h.morningOpen} – ${h.eveningClose ?? h.morningClose}`)
  }
  if (studio.hours.some((h) => h.byAppointment)) lines.push('Sunday by appointment')
  return lines
}

export default function Footer({
  studio,
  services,
}: {
  studio: StudioData
  services: { slug: string; title: string }[]
}) {
  const socials = Object.entries(studio.socials ?? {}).filter(([, url]) => url)
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-ivory/75">
      <div className="container-x pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-4">
            <Wordmark light />
            <p className="mt-6 text-sm leading-relaxed max-w-sm">
              {studio.fullName}. {studio.tagline} We design homes, workplaces and interiors with clarity, craft and care.
            </p>
            <address className="not-italic mt-6 text-sm leading-relaxed text-ivory/60">{studio.address.full}</address>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="eyebrow !text-bronze">Explore</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {navigation.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow !text-bronze">Services</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="hover:text-white transition-colors">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="eyebrow !text-bronze">Contact</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {studio.email && (
                <li><a href={`mailto:${studio.email}`} className="hover:text-white transition-colors break-all">{studio.email}</a></li>
              )}
              {studio.phone && (
                <li><a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{studio.phone}</a></li>
              )}
            </ul>
            <ul className="mt-5 space-y-1 text-xs text-ivory/50 tracking-wide">
              {hoursSummary(studio).map((l) => <li key={l}>{l}</li>)}
            </ul>
            <Link href="/contact#consultation" className="btn btn-light mt-7 !px-5">
              Book a free consultation <ArrowUpRight size={14} className="btn-arrow" />
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between text-xs text-ivory/50">
          <p>© {year} {studio.name || BRAND.name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map(([k, url]) => (
              <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                {SOCIAL_LABELS[k] ?? k}
              </a>
            ))}
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
