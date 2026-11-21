'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Scroll-jacked horizontal section for desktop: the section pins to the
 * viewport and vertical scrolling moves a horizontal track of panels.
 * Below `lg` (or with reduced motion) it renders `fallback` instead — usually
 * a swipe <Slider>. Used by Services and Selected Work on the homepage.
 */
export default function PinnedTrack({
  label,
  children,
  fallback,
  className = '',
  progressTone = 'light',
}: {
  label: string
  children: React.ReactNode
  fallback: React.ReactNode
  className?: string
  progressTone?: 'light' | 'dark'
}) {
  const reduce = useReducedMotion()
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 640px)')
    const on = () => setDesktop(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  if (!desktop || reduce) return <>{fallback}</>
  return (
    <Pinned label={label} className={className} progressTone={progressTone}>
      {children}
    </Pinned>
  )
}

function Pinned({
  label,
  children,
  className,
  progressTone,
}: {
  label: string
  children: React.ReactNode
  className: string
  progressTone: 'light' | 'dark'
}) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  useIsoLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const x = useTransform(smooth, [0, 1], [0, -distance])
  const dark = progressTone === 'dark'

  return (
    <section
      ref={section}
      aria-label={label}
      className={`relative ${className}`}
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-20">
        <motion.div ref={track} style={{ x }} className="slider-pad flex items-center gap-10 w-max will-change-transform">
          {children}
        </motion.div>
        <div className="container-x mt-10">
          <div className={`relative h-px ${dark ? 'bg-white/15' : 'bg-stone'}`} aria-hidden>
            <motion.div
              className={`absolute inset-0 origin-left ${dark ? 'bg-ivory' : 'bg-ink'}`}
              style={{ scaleX: smooth }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
