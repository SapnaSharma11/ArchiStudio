'use client'
import { createContext, useContext, useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

type ShellState = { navOpen: boolean; setNavOpen: (open: boolean) => void }
const ShellContext = createContext<ShellState>({ navOpen: false, setNavOpen: () => {} })

export function useDashboardShell() {
  return useContext(ShellContext)
}

/**
 * Dashboard chrome: charcoal sidebar (sticky on desktop, slide-in drawer below
 * `lg`) + topbar. Shares the mobile nav state through context.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <ShellContext.Provider value={{ navOpen, setNavOpen }}>
      <div className="min-h-screen bg-ivory flex text-text">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  )
}
