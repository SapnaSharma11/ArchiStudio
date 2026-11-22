'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export default function LoginForm({ from }: { from?: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.replace(from && from.startsWith('/dashboard') ? from : '/dashboard')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Incorrect password')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      <div className="relative hidden lg:block bg-ink">
        <Image
          src="/images/apn/residential-building-elevation.jpg"
          alt="Daylit architecture studio with glass walls"
          fill
          sizes="50vw"
          className="object-cover opacity-70"
          preload
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-ivory">
          <p className="text-[10px] uppercase tracking-[0.28em] text-bronze">{BRAND.descriptor}</p>
          <p className="font-display text-5xl leading-[1.05] mt-4 max-w-md">{BRAND.tagline}</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <div className="mb-12">
            <span className="font-display text-4xl tracking-[0.18em] text-ink">{BRAND.wordmark}</span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-bronze-deep mt-1.5">{BRAND.descriptor}</span>
          </div>

          <h1 className="font-display text-3xl text-ink">Studio login</h1>
          <p className="text-sm text-muted mt-1.5 mb-8">Sign in to manage projects, enquiries and the website.</p>

          <label htmlFor="password" className="label">Password</label>
          <div className="flex items-center gap-2 border-b border-stone focus-within:border-ink transition-colors mt-1">
            <Lock className="text-concrete" size={15} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              autoComplete="current-password"
              placeholder="Admin password"
              className="w-full py-3 outline-none text-sm bg-transparent"
            />
          </div>

          {error && <p className="text-rust text-sm font-semibold mt-3" role="alert">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-dark w-full mt-8 disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={15} /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight size={15} className="btn-arrow" />}
          </button>

          <p className="text-xs text-concrete mt-10">Protected area · authorised studio personnel only</p>
        </form>
      </div>
    </div>
  )
}
