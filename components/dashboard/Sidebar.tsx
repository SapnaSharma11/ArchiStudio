'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, X } from 'lucide-react'
import { BRAND } from '@/lib/brand'
import { NAV, isActive } from '@/components/dashboard/nav'
import { useDashboardShell } from '@/components/dashboard/DashboardShell'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { navOpen, setNavOpen } = useDashboardShell()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/50 lg:hidden transition-opacity ${navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setNavOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:w-64 shrink-0 bg-ink text-ivory flex flex-col
          transition-transform duration-300 lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Dashboard navigation"
      >
        <div className="px-6 h-[72px] flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="leading-none">
            <span className="font-display text-2xl tracking-[0.18em]">{BRAND.wordmark}</span>
            <span className="block text-[9px] uppercase tracking-[0.28em] text-bronze mt-1">{BRAND.descriptor}</span>
          </Link>
          <button className="lg:hidden text-ivory/70 hover:text-ivory" onClick={() => setNavOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 text-[13px]">
          {NAV.map((s, si) => (
            <div key={si} className={si ? 'mt-5' : ''}>
              {s.section && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/35">{s.section}</p>
              )}
              <ul className="space-y-0.5">
                {s.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setNavOpen(false)}
                        className={`relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          active ? 'bg-white/[0.07] text-ivory' : 'text-ivory/60 hover:text-ivory hover:bg-white/[0.04]'
                        }`}
                      >
                        {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-bronze rounded-full" />}
                        <Icon size={15} strokeWidth={1.6} className={active ? 'text-bronze' : ''} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-ivory/60 hover:text-ivory hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={15} strokeWidth={1.6} /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
