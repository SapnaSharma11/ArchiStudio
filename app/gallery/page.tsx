import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { pageMeta, SEO } from '@/lib/seo'
import PageHero from '@/components/shared/PageHero'
import ArchiveGrid, { type ArchiveItem } from '@/components/shared/ArchiveGrid'

export const metadata: Metadata = pageMeta({ title: SEO.gallery.title, description: SEO.gallery.description, path: '/gallery' })

// Live from the DB so dashboard edits appear without a redeploy.
export const dynamic = 'force-dynamic'

async function getArchive(): Promise<ArchiveItem[]> {
  try {
    const rows = await prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return rows.map((g) => ({ id: g.id, image: g.image, caption: g.caption }))
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const items = await getArchive()
  return (
    <>
      <PageHero
        label="Project archive"
        title="Light, material"
        accent="& detail."
        intro="An image archive from our projects — spaces, textures and moments we return to for inspiration."
        crumbs={[{ label: 'Project archive' }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          {items.length ? <ArchiveGrid items={items} /> : <p className="text-muted border-t border-line pt-10">Archive images coming soon.</p>}
        </div>
      </section>
    </>
  )
}
