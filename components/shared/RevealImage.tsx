'use client'
import Image, { type ImageProps } from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Image that unveils with a clip-path wipe + gentle scale when it scrolls into
 * view. Wrapper controls the aspect ratio via `className`.
 */
export default function RevealImage({
  className,
  imgClassName,
  ...img
}: Omit<ImageProps, 'fill'> & { className?: string; imgClassName?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={cn('relative overflow-hidden bg-sand rounded-media', className)}
      initial={{ clipPath: 'inset(12% 0% 0% 0%)' }}
      animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image {...img} alt={img.alt} fill className={cn('object-cover', imgClassName)} />
      </motion.div>
    </motion.div>
  )
}
