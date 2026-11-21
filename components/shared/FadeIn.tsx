'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}

/**
 * Restrained scroll reveal. framer-motion's MotionConfig (reducedMotion="user")
 * turns the movement off for visitors who prefer reduced motion.
 */
export default function FadeIn({ children, delay = 0, direction = 'up', className = '', as = 'div' }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const MotionTag = motion[as]
  const offset = 24

  return (
    <MotionTag
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === 'up' ? offset : 0,
        x: direction === 'left' ? -offset : direction === 'right' ? offset : 0,
      }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
