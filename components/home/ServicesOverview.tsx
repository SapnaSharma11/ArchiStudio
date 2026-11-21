import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import ServiceCard from '@/components/shared/ServiceCard'
import FadeIn from '@/components/shared/FadeIn'
import Slider from '@/components/shared/Slider'
import PinnedTrack from '@/components/shared/PinnedTrack'
import type { PublicService } from '@/lib/services'

function Heading() {
  return (
    <SectionHeading
      index="02"
      label="Services"
      title="From first sketch to"
      accent="final detail."
      intro="A complete architecture and interiors practice — design, drawings, visualisation and supervision under one roof."
    />
  )
}

/** Mobile / tablet / reduced motion: swipe slider. */
function SlideServices({ services }: { services: PublicService[] }) {
  return (
    <section className="py-24 sm:py-32 bg-surface overflow-hidden">
      <div className="container-x flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <Heading />
        <FadeIn>
          <Link href="/services" className="btn btn-outline text-ink shrink-0">
            All services <ArrowRight size={15} className="btn-arrow" />
          </Link>
        </FadeIn>
      </div>
      <FadeIn className="mt-14">
        <Slider label="Services" slideClassName="w-[80vw] sm:w-[44vw] lg:w-[29vw] xl:w-[26rem]">
          {services.map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} />
          ))}
        </Slider>
      </FadeIn>
    </section>
  )
}

export default function ServicesOverview({ services }: { services: PublicService[] }) {
  if (!services.length) return null
  return (
    <PinnedTrack label="Services" className="bg-surface" fallback={<SlideServices services={services} />}>
      <div className="w-[32vw] max-w-[32rem] shrink-0 pr-6">
        <Heading />
        <p className="mt-10 font-mono text-[11px] tracking-[0.22em] uppercase text-muted flex items-center gap-3">
          Scroll to explore <ArrowRight size={14} />
        </p>
      </div>

      {services.map((s, i) => (
        <Link key={s.slug} href={`/services/${s.slug}`} className="group shrink-0 w-[30vw] xl:w-[27rem]">
          <div className={`img-zoom relative overflow-hidden bg-sand ${i % 2 === 0 ? 'h-[50vh]' : 'h-[42vh]'}`}>
            {s.image && (
              <Image src={s.image} alt={`${s.title} by APN Enterprises`} fill sizes="30vw" className="object-cover" />
            )}
            <span className="absolute right-5 top-5 w-11 h-11 rounded-full bg-ivory text-ink flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <h3 className="display text-[1.7rem] xl:text-3xl text-ink mt-5 group-hover:text-bronze-deep transition-colors">{s.title}</h3>
          <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2 max-w-[26rem]">{s.description}</p>
        </Link>
      ))}

      <Link href="/services" className="group shrink-0 w-[22vw] h-[50vh] rounded-media bg-ink text-ivory flex flex-col justify-between p-10">
        <span className="eyebrow !text-bronze">Services</span>
        <span>
          <span className="display block text-4xl leading-tight">
            All <span className="text-bronze">services</span>
          </span>
          <span className="mt-8 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center transition-colors group-hover:bg-ivory group-hover:text-ink">
            <ArrowRight size={18} />
          </span>
        </span>
      </Link>
    </PinnedTrack>
  )
}
