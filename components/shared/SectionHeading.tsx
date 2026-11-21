import FadeIn from '@/components/shared/FadeIn'
import { cn } from '@/utils/cn'

/**
 * Editorial section heading: "01 — Label" eyebrow, large serif title (with an
 * optional italic accent word) and an optional intro paragraph.
 */
export default function SectionHeading({
  index,
  label,
  title,
  accent,
  intro,
  align = 'left',
  tone = 'light',
  as: Tag = 'h2',
  className,
}: {
  index?: string
  label: string
  title: string
  accent?: string
  intro?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
  className?: string
}) {
  const dark = tone === 'dark'
  return (
    <FadeIn className={cn(align === 'center' && 'text-center mx-auto', 'max-w-3xl', className)}>
      <p className={cn('eyebrow flex items-center gap-3', align === 'center' && 'justify-center', dark && '!text-bronze')}>
        {index && <span>{index}</span>}
        {index && <span aria-hidden className={cn('h-px w-8', dark ? 'bg-bronze/60' : 'bg-bronze-deep/50')} />}
        <span>{label}</span>
      </p>
      <Tag className={cn('display mt-5 text-[2.5rem] sm:text-5xl lg:text-[3.6rem]', dark ? 'text-ivory' : 'text-ink')}>
        {title}
        {accent && (
          <>
            {' '}
            <em className={cn('italic', dark ? 'text-bronze' : 'text-bronze-deep')}>{accent}</em>
          </>
        )}
      </Tag>
      {intro && (
        <p className={cn('mt-6 text-base sm:text-lg leading-relaxed', dark ? 'text-ivory/70' : 'text-muted')}>{intro}</p>
      )}
    </FadeIn>
  )
}
