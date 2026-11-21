import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PublicService } from '@/lib/services'

/** Service card with numbered label, image, title and short description. */
export default function ServiceCard({ service, index }: { service: PublicService; index: number }) {
  return (
    <Link href={`/services/${service.slug}`} className="group flex flex-col h-full">
      <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-sand">
        {service.image && (
          <Image
            src={service.image}
            alt={`${service.title} by the studio`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="pt-6 flex-1 flex flex-col border-b border-line pb-6 group-hover:border-ink transition-colors duration-500">
        <span className="text-[11px] tracking-[0.22em] text-bronze-deep font-semibold">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="display text-[1.9rem] text-ink mt-2">{service.title}</h3>
        <p className="mt-3 text-sm text-muted leading-relaxed flex-1">{service.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-ink">
          Explore <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
