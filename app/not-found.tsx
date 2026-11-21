import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="min-h-[80svh] pt-40 pb-24 flex items-center">
      <div className="container-x">
        <p className="eyebrow">404 — Page not found</p>
        <h1 className="display mt-5 text-6xl sm:text-8xl text-ink max-w-4xl">
          This room <em className="italic text-bronze-deep">isn&rsquo;t built</em> yet.
        </h1>
        <p className="mt-6 text-muted max-w-md leading-relaxed">The page you were looking for has moved or no longer exists.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-dark">Back to home <ArrowRight size={15} className="btn-arrow" /></Link>
          <Link href="/projects" className="btn btn-outline text-ink">View projects</Link>
        </div>
      </div>
    </section>
  )
}
