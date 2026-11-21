import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { PublicService } from '@/lib/services'

/** Service card (Quiet Gallery): rounded image, title with a rolling arrow, short description. */
export default function ServiceCard({ service }: { service: PublicService; index?: number }) {
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
      <div className="pt-5 flex items-start justify-between gap-4">
        <h3 className="display text-[1.6rem] text-ink">{service.title}</h3>
        <ArrowUpRight size={20} className="mt-1.5 shrink-0 text-bronze-deep transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
      <p className="mt-2 text-sm text-muted leading-relaxed">{service.description}</p>
    </Link>
  )
}
