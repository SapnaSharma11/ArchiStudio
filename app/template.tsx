'use client'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

/**
 * Subtle page transition for the public website. Templates re-mount on every
 * navigation; the dashboard and login skip the effect so admin work stays snappy.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
