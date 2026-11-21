'use client'
import { useId, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { ENQUIRY_BUDGETS, ENQUIRY_PROJECT_TYPES } from '@/lib/brand'
import { cn } from '@/utils/cn'

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '2:30 PM', '4:00 PM', '5:30 PM']

type FormState = {
  fullName: string
  email: string
  phone: string
  projectType: string
  budget: string
  location: string
  problem: string
  preferredDate: string
  preferredTime: string
}

const empty: FormState = {
  fullName: '', email: '', phone: '', projectType: '', budget: '', location: '',
  problem: '', preferredDate: '', preferredTime: '',
}

function localISODate(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

/**
 * Consultation request / project enquiry. Posts to /api/bookings (stored as a
 * Booking row → appears under Dashboard → Enquiries and emails the studio).
 */
export default function ConsultationForm({
  tone = 'light',
  compact = false,
}: {
  tone?: 'light' | 'dark'
  compact?: boolean
}) {
  const uid = useId()
  const [form, setForm] = useState<FormState>(empty)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState<string | null>(null)
  const [minDate] = useState(() => localISODate(new Date(Date.now() + 86400000)))
  const dark = tone === 'dark'

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setDone(form.fullName.split(' ')[0] || 'there')
        setForm(empty)
      } else if (data.errors) {
        setErrors(data.errors)
      } else {
        toast.error(data.message ?? 'Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const labelCls = cn('field-label', dark && '!text-ivory/60')
  const fieldCls = cn('field', dark && '!text-ivory !border-white/25 focus:!border-ivory placeholder:!text-ivory/35')
  const optionCls = 'text-ink'

  if (done) {
    return (
      <div role="status" className={cn('py-10', dark ? 'text-ivory' : 'text-ink')}>
        <span className={cn('w-12 h-12 rounded-full flex items-center justify-center', dark ? 'bg-bronze text-ink' : 'bg-ink text-ivory')}>
          <Check size={20} />
        </span>
        <h3 className="display text-4xl mt-6">Thank you, {done}.</h3>
        <p className={cn('mt-4 leading-relaxed max-w-md', dark ? 'text-ivory/70' : 'text-muted')}>
          Your request has reached Akash at APN Enterprises. We&rsquo;ll be in touch within one working day to confirm a time.
        </p>
        <button type="button" onClick={() => setDone(null)} className={cn('mt-8 link-draw text-[11px] tracking-[0.2em] uppercase font-semibold', dark ? 'text-bronze' : 'text-bronze-deep')}>
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} aria-describedby={errors.length ? `${uid}-errors` : undefined}>
      <div className={cn('grid gap-x-8 gap-y-7', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2')}>
        <div>
          <label htmlFor={`${uid}-name`} className={labelCls}>Full name *</label>
          <input id={`${uid}-name`} required autoComplete="name" value={form.fullName} onChange={set('fullName')} className={fieldCls} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={labelCls}>Email *</label>
          <input id={`${uid}-email`} type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={fieldCls} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className={labelCls}>Phone *</label>
          <input id={`${uid}-phone`} type="tel" required autoComplete="tel" minLength={10} value={form.phone} onChange={set('phone')} className={fieldCls} placeholder="+91" />
        </div>
        <div>
          <label htmlFor={`${uid}-location`} className={labelCls}>Project location *</label>
          <input id={`${uid}-location`} required value={form.location} onChange={set('location')} className={fieldCls} placeholder="City / site" />
        </div>
        <div>
          <label htmlFor={`${uid}-type`} className={labelCls}>Project type *</label>
          <select id={`${uid}-type`} required value={form.projectType} onChange={set('projectType')} className={fieldCls}>
            <option value="" disabled className={optionCls}>Select a project type</option>
            {ENQUIRY_PROJECT_TYPES.map((t) => <option key={t} value={t} className={optionCls}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-budget`} className={labelCls}>Estimated budget</label>
          <select id={`${uid}-budget`} value={form.budget} onChange={set('budget')} className={fieldCls}>
            <option value="" className={optionCls}>Prefer not to say</option>
            {ENQUIRY_BUDGETS.map((b) => <option key={b} value={b} className={optionCls}>{b}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-date`} className={labelCls}>Preferred consultation date *</label>
          <input id={`${uid}-date`} type="date" required min={minDate} value={form.preferredDate} onChange={set('preferredDate')} className={cn(fieldCls, dark && '[color-scheme:dark]')} />
        </div>
        <div>
          <label htmlFor={`${uid}-time`} className={labelCls}>Preferred time *</label>
          <select id={`${uid}-time`} required value={form.preferredTime} onChange={set('preferredTime')} className={fieldCls}>
            <option value="" disabled className={optionCls}>Select a time</option>
            {TIME_SLOTS.map((t) => <option key={t} value={t} className={optionCls}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-brief`} className={labelCls}>Tell us about your project *</label>
          <textarea
            id={`${uid}-brief`}
            required
            minLength={10}
            rows={compact ? 3 : 4}
            value={form.problem}
            onChange={set('problem')}
            className={cn(fieldCls, 'resize-none')}
            placeholder="Site, size, what you'd like to build or change, timelines…"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <ul id={`${uid}-errors`} role="alert" className={cn('mt-6 text-sm space-y-1', dark ? 'text-[#f1b8ad]' : 'text-rust')}>
          {errors.map((er) => <li key={er}>{er}</li>)}
        </ul>
      )}

      <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
        <p className={cn('text-xs leading-relaxed max-w-xs', dark ? 'text-ivory/50' : 'text-muted')}>
          We reply within one working day. Your details are used only to respond to this enquiry.
        </p>
        <button type="submit" disabled={loading} className={cn('btn disabled:opacity-60', dark ? 'btn-light' : 'btn-dark')}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Sending…' : 'Book free consultation'}
          {!loading && <ArrowRight size={15} className="btn-arrow" />}
        </button>
      </div>
    </form>
  )
}
