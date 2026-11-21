'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { StudioData } from '@/lib/clinic'
import { BRAND } from '@/lib/brand'
import { cn } from '@/utils/cn'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Process', href: '/#process' },
  { label: 'Contact', href: '/contact' },
]

/** Routes whose first section is a full-bleed photograph (header overlays it). */
function hasOverlayHero(pathname: string) {
  return pathname === '/' || /^\/projects\/[^/]+$/.test(pathname)
}

export function Wordmark({ light, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-baseline gap-2.5 leading-none', className)}>
      <span className={cn('font-display text-[1.65rem] tracking-[0.22em]', light ? 'text-white' : 'text-ink')}>
        {BRAND.wordmark}
      </span>
      <span
        className={cn(
          'hidden sm:inline text-[9px] font-semibold tracking-[0.28em] uppercase',
          light ? 'text-white/70' : 'text-muted',
        )}
      >
        Studio
      </span>
    </span>
  )
}

export default function Navbar({ studio }: { studio: StudioData }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openedAt, setOpenedAt] = useState(pathname)

  // Close the mobile menu after navigation (state reset during render — no effect needed).
  if (open && openedAt !== pathname) {
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const overlay = hasOverlayHero(pathname) && !scrolled && !open
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : !href.includes('#') && pathname.startsWith(href)

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500',
          overlay
            ? 'bg-transparent border-b border-white/15 text-white'
            : 'bg-ivory/92 backdrop-blur-md border-b border-line text-ink',
          open && 'bg-ink border-ink text-white',
        )}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 bg-ink text-white px-3 py-2 text-sm z-50">
          Skip to content
        </a>
        <div className="container-x h-[72px] lg:h-20 flex items-center justify-between gap-6">
          <Link href="/" aria-label={`${studio.name} — home`} className="shrink-0">
            <Wordmark light={overlay || open} />
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-9">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className="link-draw pb-0.5 text-[0.9rem] transition-opacity aria-[current=page]:opacity-100 opacity-70 hover:opacity-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact#consultation"
              className={cn(
                'hidden md:inline-flex btn !py-3 !px-5',
                overlay ? 'btn-outline-light' : 'btn-dark',
              )}
            >
              Get a Consultation <ArrowUpRight size={14} className="btn-arrow" />
            </Link>
            <button
              type="button"
              className="lg:hidden relative w-11 h-11 -mr-2 flex items-center justify-center"
              onClick={() => {
                setOpenedAt(pathname)
                setOpen((o) => !o)
              }}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className={cn('absolute h-px w-6 bg-current transition-transform duration-500', open ? 'rotate-45' : '-translate-y-[5px]')} />
              <span className={cn('absolute h-px w-6 bg-current transition-transform duration-500', open ? '-rotate-45' : 'translate-y-[5px]')} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-ink text-ivory lg:hidden flex flex-col pt-24 pb-10 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <nav aria-label="Mobile" className="container-x flex-1">
              <ul className="border-t border-white/10">
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-white/10"
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 display text-4xl"
                    >
                      {l.label}
                      <span className="text-[11px] tracking-[0.2em] text-bronze font-sans">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link href="/contact#consultation" onClick={() => setOpen(false)} className="btn btn-light w-full mt-8">
                Get a Consultation <ArrowUpRight size={14} />
              </Link>
            </nav>
            <div className="container-x mt-10 text-sm text-ivory/60 space-y-1">
              {studio.email && <a href={`mailto:${studio.email}`} className="block">{studio.email}</a>}
              {studio.phone && <a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="block">{studio.phone}</a>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
