'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Decorative, muted, looping background video.
 * - Plays only while on screen (saves battery / data), shows the poster otherwise.
 * - Respects prefers-reduced-motion: stays on the poster frame.
 */
export default function BackgroundVideo({
  src,
  poster,
  className,
  eager = false,
}: {
  src: string
  poster?: string
  className?: string
  /** Start loading immediately (hero). Others load when scrolled near. */
  eager?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'none'}
      aria-hidden
      tabIndex={-1}
      className={cn('absolute inset-0 w-full h-full object-cover pointer-events-none', className)}
    />
  )
}
