'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import FadeIn from '@/components/shared/FadeIn'
import site from '@/data/site.json'
import { cn } from '@/utils/cn'

const ease = [0.22, 1, 0.36, 1] as const
/** Scroll distance (in viewport heights) spent on each stage while pinned. */
const VH_PER_STEP = 70

type Step = (typeof site.process)[number]

const grid =
  '[background-image:linear-gradient(var(--color-stone)_1px,transparent_1px),linear-gradient(90deg,var(--color-stone)_1px,transparent_1px)] [background-size:88px_88px]'

function Deliverables({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {items.map((d) => (
        <li key={d} className="flex items-center gap-2.5 text-sm text-ink">
          <span aria-hidden className="w-3 h-px bg-bronze-deep" /> {d}
        </li>
      ))}
    </ul>
  )
}

/**
 * Desktop: the section pins and scrolling advances through the five stages —
 * the photograph, the open stage and the timeline progress all follow scroll.
 * Clicking a stage scrolls the page to it.
 */
function PinnedProcess({ steps, index }: { steps: Step[]; index?: string }) {
  const section = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length)))
    if (i !== active) setActive(i)
  })

  const jump = (i: number) => {
    const el = section.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: top + ((i + 0.5) / steps.length) * range, behavior: reduce ? 'auto' : 'smooth' })
  }

  const step = steps[active]

  return (
    <section
      ref={section}
      className="relative hidden lg:block bg-sand/60"
      style={{ height: `${100 + steps.length * VH_PER_STEP}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div aria-hidden className={cn('absolute inset-0 opacity-[0.35] pointer-events-none', grid)} />
        <div className="relative container-x h-full pt-28 pb-10 grid grid-cols-12 gap-14 items-center">
          {/* Left: heading + stage list */}
          <div className="col-span-5 flex flex-col justify-center h-full">
            <SectionHeading index={index ?? undefined} label="Our process" title="A clear path from" accent="idea to handover." />

            <ol className="relative mt-10" aria-label="Project stages">
              <span aria-hidden className="absolute left-[11px] top-4 bottom-4 w-px bg-stone" />
              <motion.span
                aria-hidden
                className="absolute left-[11px] top-4 bottom-4 w-px bg-ink origin-top"
                style={{ scaleY: scrollYProgress }}
              />
              {steps.map((s, i) => {
                const isActive = i === active
                return (
                  <li key={s.title} className="relative pl-12">
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-0 top-[15px] w-[23px] h-[23px] rotate-45 border transition-colors duration-500 flex items-center justify-center',
                        isActive ? 'bg-ink border-ink' : i < active ? 'bg-bronze border-bronze' : 'bg-ivory border-stone',
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5', isActive ? 'bg-bronze' : 'bg-transparent')} />
                    </span>
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-current={isActive ? 'step' : undefined}
                      className="w-full text-left py-2.5 flex items-baseline gap-4 group"
                    >
                      <span className={cn('text-[11px] tracking-[0.22em] font-semibold tabular-nums transition-colors', isActive ? 'text-bronze-deep' : 'text-muted')}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cn(
                          'display transition-all duration-500',
                          isActive ? 'text-ink text-[2.1rem] xl:text-4xl' : 'text-ink/40 text-2xl xl:text-[1.7rem] group-hover:text-ink/75',
                        )}
                      >
                        {s.title}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5 pl-9">
                            <p className="text-muted leading-relaxed text-[0.95rem]">{s.text}</p>
                            <Deliverables items={s.deliverables} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ol>

            <p className="font-mono mt-6 pl-12 text-[10px] tracking-[0.22em] uppercase text-muted">
              Scroll to move through the stages · Typical house <span className="text-ink">14 – 24 months</span>
            </p>
          </div>

          {/* Right: photograph for the active stage */}
          <div className="col-span-7 h-full max-h-[78vh] self-center">
            <div className="relative h-full overflow-hidden bg-ink">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease }}
                >
                  <Image src={step.image} alt={step.alt} fill sizes="58vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden />
              <span aria-hidden className="absolute top-6 right-8 display text-[9rem] leading-none text-ivory/20 select-none">
                {String(active + 1).padStart(2, '0')}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-10 text-ivory flex items-end justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-bronze-soft">
                    Stage {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={active}
                      className="display text-5xl mt-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      {step.title}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono block text-[10px] tracking-[0.24em] uppercase text-ivory/60">Duration</span>
                  <span className="block mt-1 text-sm">{step.duration}</span>
                  <Link href="/contact#consultation" className="font-mono mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-ivory hover:text-bronze-soft">
                    Start a project <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Mobile / tablet: every stage stacked with its photograph — normal scrolling reveals them. */
function StackedProcess({ steps, index }: { steps: Step[]; index?: string }) {
  return (
    <section className="lg:hidden relative py-24 sm:py-32 bg-sand/60 overflow-hidden">
      <div aria-hidden className={cn('absolute inset-0 opacity-[0.3] pointer-events-none', grid)} />
      <div className="relative container-x">
        <SectionHeading
          index={index ?? undefined}
          label="Our process"
          title="A clear path from"
          accent="idea to handover."
          intro="Five stages, each with defined deliverables and sign-off — so you always know what happens next, and why."
        />
        <ol className="mt-14 space-y-16">
          {steps.map((s, i) => (
            <FadeIn as="li" key={s.title}>
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                <Image src={s.image} alt={s.alt} fill sizes="(min-width: 640px) 90vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden />
                <span className="absolute left-5 bottom-4 display text-6xl text-ivory leading-none">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-mono absolute right-5 bottom-5 text-[10px] tracking-[0.2em] uppercase text-ivory/80">{s.duration}</span>
              </div>
              <h3 className="display text-3xl sm:text-4xl text-ink mt-5">{s.title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{s.text}</p>
              <Deliverables items={s.deliverables} />
            </FadeIn>
          ))}
        </ol>
        <Link href="/contact#consultation" className="btn btn-dark mt-14">
          Start with a discovery call <ArrowRight size={15} className="btn-arrow" />
        </Link>
      </div>
    </section>
  )
}

export default function ProcessSection({ index = '05' }: { index?: string | null }) {
  const steps = site.process
  return (
    <>
      {/* anchor target for "/#process" that works at every breakpoint */}
      <span id="process" aria-hidden className="block" />
      <PinnedProcess steps={steps} index={index ?? undefined} />
      <StackedProcess steps={steps} index={index ?? undefined} />
    </>
  )
}
