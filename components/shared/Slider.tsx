'use client'
import { Children, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Horizontal slider built on native scroll-snap: swipe / trackpad on touch,
 * click-drag with a mouse, arrow buttons, keyboard (focus the track + ←/→),
 * and a progress line. The track bleeds to the viewport edge while its first
 * slide lines up with the page container (`.slider-pad` in globals.css).
 */
export default function Slider({
  children,
  label,
  slideClassName = 'w-[82vw] sm:w-[46vw] lg:w-[31vw]',
  tone = 'light',
  gap = 'gap-5 sm:gap-8',
  align = 'start',
}: {
  children: React.ReactNode
  label: string
  slideClassName?: string
  tone?: 'light' | 'dark'
  gap?: string
  align?: 'start' | 'end'
}) {
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 })
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState({ progress: 0, index: 0, atStart: true, atEnd: false })
  const slides = Children.toArray(children)
  const dark = tone === 'dark'

  const step = useCallback(() => {
    const el = track.current
    const first = el?.children[0] as HTMLElement | undefined
    if (!el || !first) return 0
    const gapPx = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    return first.offsetWidth + gapPx
  }, [])

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const s = step() || 1
    setState({
      progress: max > 0 ? el.scrollLeft / max : 1,
      index: Math.min(slides.length - 1, Math.round(el.scrollLeft / s)),
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft >= max - 4,
    })
  }, [slides.length, step])

  useEffect(() => {
    update()
    const el = track.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  const go = (dir: -1 | 1) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.current?.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' })
  }

  // Mouse drag-to-scroll (touch devices already swipe natively).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !track.current) return
    drag.current = { active: true, moved: false, x: e.clientX, left: track.current.scrollLeft }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.active || !track.current) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true
      setDragging(true)
      track.current.setPointerCapture(e.pointerId)
    }
    if (d.moved) track.current.scrollLeft = d.left - dx
  }
  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    if (track.current?.hasPointerCapture(e.pointerId)) track.current.releasePointerCapture(e.pointerId)
    setDragging(false)
  }
  // Swallow the click that ends a drag so cards don't navigate accidentally.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  const btn = cn(
    'w-12 h-12 rounded-full border flex items-center justify-center transition-colors duration-300 disabled:opacity-30 disabled:pointer-events-none',
    dark ? 'border-white/25 text-ivory hover:bg-ivory hover:text-ink' : 'border-stone text-ink hover:bg-ink hover:text-ivory hover:border-ink',
  )

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        tabIndex={0}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          'slider-pad flex overflow-x-auto overscroll-x-contain pb-2 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'focus-visible:ring-1 focus-visible:ring-bronze-deep/40',
          '[&_img]:pointer-events-none [&_a]:[-webkit-user-drag:none]',
          dragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab snap-x snap-mandatory scroll-smooth',
          align === 'end' && 'items-end',
          gap,
        )}
      >
        {slides.map((child, i) => (
          <div
            key={i}
            className={cn('snap-start shrink-0', slideClassName)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {child}
          </div>
        ))}
        {/* end spacer so the last slide can snap flush with the gutter */}
        <div aria-hidden className="shrink-0 w-px" />
      </div>

      <div className="container-x mt-10 flex items-center gap-6">
        <span className={cn('text-xs tracking-[0.2em] tabular-nums shrink-0', dark ? 'text-ivory/60' : 'text-muted')}>
          {String(state.index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
        <div className={cn('relative h-px flex-1', dark ? 'bg-white/15' : 'bg-stone')} aria-hidden>
          <div
            className={cn('absolute inset-y-0 left-0 transition-[width] duration-300', dark ? 'bg-ivory' : 'bg-ink')}
            style={{ width: `${Math.max(8, state.progress * 100)}%` }}
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <button type="button" onClick={() => go(-1)} disabled={state.atStart} aria-label="Previous" className={btn}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" onClick={() => go(1)} disabled={state.atEnd} aria-label="Next" className={btn}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
