import Image from 'next/image'
import FadeIn from '@/components/shared/FadeIn'
import Breadcrumbs, { type Crumb } from '@/components/shared/Breadcrumbs'

/**
 * Inner-page hero. Text-only by default (ivory); pass `image` for a wide
 * photographic band beneath the title.
 */
export default function PageHero({
  label,
  title,
  accent,
  intro,
  image,
  imageAlt,
  crumbs,
}: {
  label: string
  title: string
  accent?: string
  intro?: string
  image?: string | null
  imageAlt?: string
  crumbs?: Crumb[]
}) {
  return (
    <section className="pt-32 sm:pt-40 bg-ivory">
      <div className="container-x">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="grid lg:grid-cols-12 gap-8 items-end pb-12 sm:pb-16">
          <FadeIn className="lg:col-span-8">
            <p className="eyebrow">{label}</p>
            <h1 className="display mt-5 text-[2.75rem] sm:text-6xl lg:text-[5.25rem] text-ink">
              {title}
              {accent && (
                <>
                  {' '}
                  <em className="not-italic text-bronze-deep">{accent}</em>
                </>
              )}
            </h1>
          </FadeIn>
          {intro && (
            <FadeIn delay={0.15} className="lg:col-span-4">
              <p className="text-muted leading-relaxed text-base sm:text-lg">{intro}</p>
            </FadeIn>
          )}
        </div>
      </div>
      {image && (
        <div className="container-x">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-sand rounded-media">
            <Image src={image} alt={imageAlt ?? ''} fill preload sizes="(min-width: 1400px) 1400px, 100vw" className="object-cover" />
          </div>
        </div>
      )}
    </section>
  )
}
