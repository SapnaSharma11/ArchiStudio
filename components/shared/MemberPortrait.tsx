import Image from 'next/image'
import { initials } from '@/lib/team'
import { cn } from '@/utils/cn'

/**
 * Team portrait. Without a photo it renders an architectural "drawing sheet"
 * monogram (grid + serif initials) rather than an empty grey box.
 */
export default function MemberPortrait({
  name,
  role,
  photo,
  sizes,
  className,
}: {
  name: string
  role: string
  photo: string | null
  sizes: string
  className?: string
}) {
  return (
    <div className={cn('img-zoom relative overflow-hidden bg-sand', className)}>
      {photo ? (
        <Image src={photo} alt={`${name}, ${role}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(var(--color-stone)_1px,transparent_1px),linear-gradient(90deg,var(--color-stone)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute inset-5 border border-stone" />
          <span className="absolute inset-0 flex items-center justify-center display text-[5.5rem] sm:text-8xl text-ink/80 transition-transform duration-700 group-hover:scale-105">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  )
}
