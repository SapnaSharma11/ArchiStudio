import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/crud'
import { LEGACY_SERVICE_CATEGORY } from '@/lib/brand'
import ServicesManager from '@/components/dashboard/services/ServicesManager'
import type { Item } from '@/components/dashboard/ResourceManager'

export const dynamic = 'force-dynamic'

export default async function DashboardServicesPage() {
  let initial: Item[] = []
  try {
    const rows = await prisma.service.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })
    // Pre-rebrand rows used other category values — show (and save) them as the new ones.
    initial = serialize(
      rows.map((s) => ({ ...s, category: LEGACY_SERVICE_CATEGORY[s.category] ?? s.category })),
    ) as Item[]
  } catch {
    /* DB not ready */
  }
  return <ServicesManager initial={initial} />
}
