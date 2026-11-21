'use client'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu } from 'lucide-react'
import { BRAND } from '@/lib/brand'
import { titleFor } from '@/components/dashboard/nav'
import { useDashboardShell } from '@/components/dashboard/DashboardShell'

export default function Topbar() {
  const pathname = usePathname()
  const { setNavOpen } = useDashboardShell()
  const title = titleFor(pathname)

  return (
    <header className="h-[72px] bg-ivory/90 backdrop-blur border-b border-line px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden -ml-1 p-2 rounded-md text-ink hover:bg-sand"
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-2xl sm:text-[28px] text-ink truncate leading-none">{title}</h1>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted hover:text-ink"
        >
          View website <ArrowUpRight size={14} />
        </a>
        <div className="flex items-center gap-2.5 sm:pl-4 sm:border-l border-line">
          <div className="w-9 h-9 rounded-full bg-ink text-ivory flex items-center justify-center font-display text-lg">
            {BRAND.wordmark.charAt(0)}
          </div>
          <div className="leading-tight hidden md:block">
            <div className="text-[13px] font-semibold text-ink">Super Admin</div>
            <div className="text-[10px] text-muted">{BRAND.name}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
