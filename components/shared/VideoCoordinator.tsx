'use client'
import { useEffect } from 'react'

/**
 * Site-wide rule for tap-to-play videos (those with controls):
 * they start muted, and starting one pauses any other that is playing.
 * Decorative background loops (no controls) are left alone.
 */
export default function VideoCoordinator() {
  useEffect(() => {
    const onPlay = (e: Event) => {
      const current = e.target
      if (!(current instanceof HTMLVideoElement) || !current.controls) return
      document.querySelectorAll<HTMLVideoElement>('video[controls]').forEach((v) => {
        if (v !== current && !v.paused) v.pause()
      })
    }
    // 'play' doesn't bubble — listen in the capture phase.
    document.addEventListener('play', onPlay, true)
    return () => document.removeEventListener('play', onPlay, true)
  }, [])
  return null
}
