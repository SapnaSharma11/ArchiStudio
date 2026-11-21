'use client'
import { useId, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowRight, Loader2 } from 'lucide-react'
import StarRating from './StarRating'

/** Client review form → /api/testimonials (moderated in Dashboard → Testimonials). */
export default function FeedbackForm() {
  const uid = useId()
  const [form, setForm] = useState({ name: '', rating: 0, message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.rating === 0) {
      toast.error('Please choose a rating.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Thank you — your words mean a lot to the studio.')
        setForm({ name: '', rating: 0, message: '' })
      } else {
        toast.error(data.errors ? data.errors.join(', ') : data.message || 'Something went wrong.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line p-6 sm:p-10">
      <h2 className="display text-4xl text-ink">Share your experience</h2>
      <p className="text-muted text-sm mt-3 leading-relaxed">Worked with us? A few words help future clients understand how we work.</p>
      <div className="mt-8 space-y-7">
        <div>
          <label htmlFor={`${uid}-name`} className="field-label">Name & project *</label>
          <input id={`${uid}-name`} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" placeholder="e.g. Priya Shah — Garden Apartment" />
        </div>
        <div>
          <span className="field-label mb-3">Rating *</span>
          <StarRating rating={form.rating} interactive onChange={(r) => setForm((f) => ({ ...f, rating: r }))} size={24} />
        </div>
        <div>
          <label htmlFor={`${uid}-msg`} className="field-label">Your review *</label>
          <textarea id={`${uid}-msg`} required minLength={10} maxLength={500} rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="field resize-none" placeholder="What was it like to design and build with the studio?" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-dark mt-10 disabled:opacity-60">
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        {loading ? 'Sending…' : 'Submit review'}
        {!loading && <ArrowRight size={15} className="btn-arrow" />}
      </button>
    </form>
  )
}
