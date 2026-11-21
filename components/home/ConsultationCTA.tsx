import Image from 'next/image'
import ConsultationForm from '@/components/shared/ConsultationForm'
import FadeIn from '@/components/shared/FadeIn'
import type { StudioData } from '@/lib/clinic'

export default function ConsultationCTA({ studio }: { studio: StudioData }) {
  return (
    <section id="consultation" className="bg-ink text-ivory scroll-mt-20">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[360px] lg:min-h-full">
          <Image
            src="/images/arche/house-black-dusk.jpg"
            alt="Dark-clad contemporary house glowing at dusk"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink/40" aria-hidden />
          <div className="absolute bottom-0 left-0 p-6 sm:p-10 lg:hidden">
            <p className="eyebrow !text-bronze">Start a project</p>
          </div>
        </div>
        <div className="px-4 sm:px-10 lg:px-16 xl:px-24 py-16 sm:py-24">
          <FadeIn>
            <p className="eyebrow !text-bronze hidden lg:block">Start a project</p>
            <h2 className="display mt-5 text-[2.6rem] sm:text-6xl">
              Let&rsquo;s Build Something <em className="not-italic text-bronze">Meaningful.</em>
            </h2>
            <p className="mt-6 text-ivory/65 leading-relaxed max-w-lg">
              Tell us a little about your plot and plans. Your first design consultation with Akash is free — at the office,
              on site or online — to talk through possibilities, process and fees.
            </p>
          </FadeIn>
          <div className="mt-12">
            <ConsultationForm tone="dark" compact />
          </div>
          {(studio.email || studio.phone) && (
            <p className="mt-10 text-sm text-ivory/50">
              Prefer to talk?{' '}
              {studio.phone && <a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="text-ivory link-draw">{studio.phone}</a>}
              {studio.phone && studio.email && ' · '}
              {studio.email && <a href={`mailto:${studio.email}`} className="text-ivory link-draw">{studio.email}</a>}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
