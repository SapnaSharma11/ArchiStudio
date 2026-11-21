'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Loader2 } from 'lucide-react'
import ImageUpload from '@/components/dashboard/ImageUpload'
import { Monogram, btnPrimary } from '@/components/dashboard/ui'

export type PrincipalDTO = {
  photo: string | null
  name: string
  designation: string | null
  biography: string | null
  experience: string | null
  education: string[]
  specializations: string[]
  achievements: string[]
  phone: string | null
  email: string | null
  socials: Record<string, string> | null
}

const SOCIALS = ['linkedin', 'instagram', 'behance', 'pinterest'] as const

export default function PrincipalForm({ initial }: { initial: PrincipalDTO | null }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({
    photo: initial?.photo ?? '',
    name: initial?.name ?? '',
    designation: initial?.designation ?? '',
    biography: initial?.biography ?? '',
    experience: initial?.experience ?? '',
    education: (initial?.education ?? []).join('\n'),
    specializations: (initial?.specializations ?? []).join('\n'),
    achievements: (initial?.achievements ?? []).join('\n'),
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    socials: { ...(initial?.socials ?? {}) } as Record<string, string>,
  })

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft({ ...draft, [key]: value })
  }

  async function save() {
    setSaving(true)
    const toArr = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
    const socials = Object.fromEntries(Object.entries(draft.socials).filter(([, v]) => v))
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: draft.photo || null,
          name: draft.name,
          designation: draft.designation || null,
          biography: draft.biography || null,
          experience: draft.experience || null,
          education: toArr(draft.education),
          specializations: toArr(draft.specializations),
          achievements: toArr(draft.achievements),
          phone: draft.phone || null,
          email: draft.email || null,
          socials: Object.keys(socials).length ? socials : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Principal profile saved')
        router.refresh()
      } else toast.error(data.error ?? 'Could not save')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const field = (key: 'name' | 'designation' | 'experience' | 'phone' | 'email', label: string, placeholder?: string) => (
    <div>
      <label className="label" htmlFor={`p-${key}`}>{label}</label>
      <input id={`p-${key}`} className="input" placeholder={placeholder} value={draft[key]} onChange={(e) => set(key, e.target.value)} />
    </div>
  )
  const list = (key: 'specializations' | 'education' | 'achievements', label: string) => (
    <div>
      <label className="label" htmlFor={`p-${key}`}>{label}</label>
      <textarea id={`p-${key}`} rows={4} className="input" value={draft[key]} onChange={(e) => set(key, e.target.value)} />
      <p className="text-[11px] text-concrete mt-1">One per line</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <section className="card p-5 sm:p-6">
        <p className="label">Portrait</p>
        <div className="mt-2"><ImageUpload value={draft.photo} folder="principal" onChange={(url) => set('photo', url)} hint="Portrait 4:5, at least 1200px tall" /></div>
        <div className="flex items-center gap-3 mt-5">
          {!draft.photo && <Monogram name={draft.name || 'A'} className="w-12 h-12 text-lg" />}
          <div>
            <h3 className="font-display text-2xl text-ink leading-none">{draft.name || 'Your name'}</h3>
            <p className="text-xs text-muted mt-1">{draft.designation || 'Principal Architect'}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted mt-4 leading-relaxed">Shown on the About page alongside the studio team.</p>
      </section>

      <section className="lg:col-span-2 card p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('name', 'Name')}
          {field('designation', 'Title', 'Principal Architect & Founder')}
        </div>
        <div>
          <label className="label" htmlFor="p-bio">Biography</label>
          <textarea id="p-bio" rows={5} className="input" value={draft.biography} onChange={(e) => set('biography', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field('experience', 'Years of practice', '16 years')}
          {field('phone', 'Phone')}
          {field('email', 'Email')}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {list('specializations', 'Expertise')}
          {list('education', 'Education')}
          {list('achievements', 'Achievements & registrations')}
        </div>
        <div>
          <p className="label">Profiles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {SOCIALS.map((s) => (
              <input
                key={s}
                className="input"
                aria-label={`${s} URL`}
                placeholder={`${s[0].toUpperCase()}${s.slice(1)} URL`}
                value={draft.socials[s] ?? ''}
                onChange={(e) => set('socials', { ...draft.socials, [s]: e.target.value })}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving} className={btnPrimary}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save profile
          </button>
        </div>
      </section>
    </div>
  )
}
