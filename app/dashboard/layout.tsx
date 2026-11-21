import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { BRAND } from '@/lib/brand'
import DashboardShell from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: { absolute: `Dashboard | ${BRAND.name}` },
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Authoritative server-side guard (proxy.ts only does an optimistic check).
  await requireAdmin()
  return <DashboardShell>{children}</DashboardShell>
}
