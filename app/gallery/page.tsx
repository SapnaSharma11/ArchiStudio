import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { pageMeta, SEO } from '@/lib/seo'
import PageHero from '@/components/shared/PageHero'
import ArchiveGrid, { type ArchiveItem } from '@/components/shared/ArchiveGrid'
import FilmGrid, { type Film } from '@/components/shared/FilmGrid'
import SectionHeading from '@/components/shared/SectionHeading'

export const metadata: Metadata = pageMeta({ title: SEO.gallery.title, description: SEO.gallery.description, path: '/gallery' })

// Live from the DB so dashboard edits appear without a redeploy.
export const dynamic = 'force-dynamic'

async function getFilms(): Promise<Film[]> {
  try {
    return await prisma.session.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, videoUrl: true, image: true, sessionType: true },
    })
  } catch {
    return []
  }
}

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
  const [items, films] = await Promise.all([getArchive(), getFilms()])
  return (
    <>
      <PageHero
        label="Photos & films"
        title="Light, material"
        accent="& detail."
        intro="An image archive from our projects — spaces, textures and moments we return to for inspiration."
        crumbs={[{ label: 'Photos & films' }]}
      />
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          {items.length ? <ArchiveGrid items={items} /> : <p className="text-muted border-t border-line pt-10">Archive images coming soon.</p>}
        </div>
      </section>
      {films.length > 0 && (
        <section id="films" className="scroll-mt-24 pb-24 sm:pb-32">
          <div className="container-x">
            <SectionHeading label="Films" title="Our work," accent="on video." intro="Short clips from APN Enterprises sites and finished interiors." />
            <div className="mt-12">
              <FilmGrid films={films} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
