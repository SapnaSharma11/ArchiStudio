import FadeIn from '@/components/shared/FadeIn'
import { cn } from '@/utils/cn'

/**
 * Section heading: dot label (no numbering — `index` is accepted but unused), large display title (with an
 * optional accent word, set in bronze) and an optional intro paragraph.
 */
export default function SectionHeading({
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
      <p className={cn('eyebrow', align === 'center' && 'justify-center', dark && '!text-ivory/60')}>{label}</p>
      <Tag className={cn('display mt-5 text-[2.5rem] sm:text-5xl lg:text-[3.6rem]', dark ? 'text-ivory' : 'text-ink')}>
        {title}
        {accent && (
          <>
            {' '}
            <em className={cn('not-italic', dark ? 'text-bronze' : 'text-bronze-deep')}>{accent}</em>
          </>
        )}
      </Tag>
      {intro && (
        <p className={cn('mt-6 text-base sm:text-lg leading-relaxed', dark ? 'text-ivory/70' : 'text-muted')}>{intro}</p>
      )}
    </FadeIn>
  )
}
