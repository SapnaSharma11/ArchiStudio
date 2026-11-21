'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Loader2, Plus, Trash2, Upload, Film, CheckCircle2, AlertCircle, ShieldCheck, Palette, Mail } from 'lucide-react'
import ImageUpload from '@/components/dashboard/ImageUpload'
import { uploadFile } from '@/components/dashboard/upload'
import { btnPrimary, btnSecondary, btnIcon } from '@/components/dashboard/ui'

type Hours = {
  day: string
  morningOpen?: string | null
  morningClose?: string | null
  eveningOpen?: string | null
  eveningClose?: string | null
  byAppointment?: boolean
}
type Stat = { value: string; label: string }

export type StudioSettingsDTO = {
  name: string
  fullName: string | null
  tagline: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  addressLine1: string | null
  addressLine2: string | null
  state: string | null
  pincode: string | null
  addressFull: string | null
  mapsEmbedUrl: string | null
  heroVideoUrl: string | null
  heroImageUrl: string | null
  hours: Hours[]
  stats: Stat[]
  socials: Record<string, string> | null
}

type BrandInfo = { name: string; wordmark: string; descriptor: string; tagline: string; siteUrl: string }
type MailInfo = { configured: boolean; sender: string; notifyOverride: boolean; senderName: string }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SOCIALS = ['instagram', 'linkedin', 'pinterest', 'behance', 'facebook', 'youtube'] as const

function Card({ title, children, wide, icon }: { title: string; children: React.ReactNode; wide?: boolean; icon?: React.ReactNode }) {
  return (
    <section className={`card p-5 sm:p-6 ${wide ? 'lg:col-span-2' : ''}`}>
      <h3 className="font-display text-xl text-ink mb-4 flex items-center gap-2">{icon}{title}</h3>
      {children}
    </section>
  )
}
function L({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label className="label" htmlFor={htmlFor}>{children}</label>
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-line last:border-0 text-sm">
      <span className="text-muted">{k}</span>
      <span className="text-ink text-right break-all">{v}</span>
    </div>
  )
}

export default function StudioSettingsForm({ initial, brand, mail }: { initial: StudioSettingsDTO; brand: BrandInfo; mail: MailInfo }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [d, setD] = useState<StudioSettingsDTO>({
    ...initial,
    hours: DAYS.map((day) => initial.hours.find((h) => h.day === day) ?? { day }),
    stats: initial.stats.length ? initial.stats : [],
    socials: initial.socials ?? {},
  })

  function set<K extends keyof StudioSettingsDTO>(k: K, v: StudioSettingsDTO[K]) {
    setD({ ...d, [k]: v })
  }
  function setHour(i: number, patch: Partial<Hours>) {
    const hours = [...d.hours]
    hours[i] = { ...hours[i], ...patch }
    setD({ ...d, hours })
  }
  function setStat(i: number, patch: Partial<Stat>) {
    const stats = [...d.stats]
    stats[i] = { ...stats[i], ...patch }
    setD({ ...d, stats })
  }

  async function uploadVideo(file: File) {
    setUploadingVideo(true)
    try {
      set('heroVideoUrl', await uploadFile(file, 'hero'))
      toast.success('Video uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  async function save() {
    setSaving(true)
    const socials = Object.fromEntries(Object.entries(d.socials ?? {}).filter(([, v]) => v))
    try {
      // API path unchanged: /api/admin/clinic (ClinicSettings table).
      const res = await fetch('/api/admin/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...d,
          stats: d.stats.filter((s) => s.value || s.label),
          socials: Object.keys(socials).length ? socials : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Studio settings saved')
        router.refresh()
      } else toast.error(data.error ?? 'Could not save')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const text = (k: keyof StudioSettingsDTO, label: string, placeholder?: string) => (
    <div>
      <L htmlFor={`s-${k}`}>{label}</L>
      <input id={`s-${k}`} className="input" placeholder={placeholder} value={(d[k] as string | null) ?? ''} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card title="General">
        <div className="space-y-4">
          {text('name', 'Studio name', 'ARCHÉ Studio')}
          {text('fullName', 'Descriptor', 'Architecture & Interior Design Consultancy')}
          {text('tagline', 'Tagline', 'Designing Spaces. Creating Experiences.')}
        </div>
      </Card>

      <Card title="Contact">
        <div className="space-y-4">
          {text('email', 'Business email', 'hello@yourstudio.com')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {text('phone', 'Contact number', '+91 …')}
            {text('whatsapp', 'WhatsApp (with country code)', '91…')}
          </div>
          <p className="text-[11px] text-muted">Shown on the website footer and Contact page. Enquiry alerts are emailed to the address in <code>STUDIO_NOTIFY_EMAIL</code> (or the sending mailbox).</p>
        </div>
      </Card>

      <Card title="Location" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {text('addressLine1', 'Address line 1')}
            {text('addressLine2', 'Address line 2')}
            {text('state', 'State')}
            {text('pincode', 'PIN code')}
          </div>
          {text('addressFull', 'Full address (shown on site)')}
          <div>
            <L htmlFor="s-map">Google Maps embed URL</L>
            <textarea id="s-map" rows={2} className="input" value={d.mapsEmbedUrl ?? ''} onChange={(e) => set('mapsEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?…" />
          </div>
        </div>
      </Card>

      <Card title="Homepage hero">
        <L>Hero image</L>
        <div className="mt-1.5"><ImageUpload value={d.heroImageUrl} folder="hero" onChange={(url) => set('heroImageUrl', url)} hint="Landscape, at least 2400px wide" /></div>
        <div className="mt-5">
          <L htmlFor="s-video">Background film (optional — overrides the image)</L>
          <div className="flex items-center gap-2 mt-1.5">
            <input id="s-video" className="input !mt-0" value={d.heroVideoUrl ?? ''} onChange={(e) => set('heroVideoUrl', e.target.value)} placeholder="/videos/… or https://…" />
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo} className={`${btnSecondary} shrink-0`}>
              {uploadingVideo ? <Loader2 className="animate-spin" size={15} /> : <Upload size={15} />} Upload
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
          </div>
          {d.heroVideoUrl && <p className="text-xs text-muted mt-2 flex items-center gap-1.5 break-all"><Film size={13} className="shrink-0" /> {d.heroVideoUrl}</p>}
        </div>
      </Card>

      <Card title="Studio in numbers">
        <div className="space-y-2">
          {d.stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input !mt-0 w-24" aria-label="Stat value" value={s.value} onChange={(e) => setStat(i, { value: e.target.value })} placeholder="140+" />
              <input className="input !mt-0 flex-1" aria-label="Stat label" value={s.label} onChange={(e) => setStat(i, { label: e.target.value })} placeholder="Projects completed" />
              <button onClick={() => set('stats', d.stats.filter((_, j) => j !== i))} className={`${btnIcon} hover:!text-rust`} aria-label="Remove stat"><Trash2 size={15} /></button>
            </div>
          ))}
          <button onClick={() => set('stats', [...d.stats, { value: '', label: '' }])} className="text-ink text-sm font-semibold flex items-center gap-1.5 mt-2 hover:text-bronze-deep"><Plus size={15} /> Add stat</button>
        </div>
      </Card>

      <Card title="Studio hours" wide>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-muted pb-1">
            <span className="col-span-2" />
            <span className="col-span-7 grid grid-cols-4 gap-1.5"><span>Opens</span><span>Break</span><span>Resumes</span><span>Closes</span></span>
          </div>
          {d.hours.map((h, i) => (
            <div key={h.day} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-12 sm:col-span-2 text-sm font-semibold text-ink">{h.day}</span>
              {h.byAppointment ? (
                <span className="col-span-8 sm:col-span-7 text-sm text-muted italic">By appointment</span>
              ) : (
                <div className="col-span-8 sm:col-span-7 grid grid-cols-4 gap-1.5">
                  {(['morningOpen', 'morningClose', 'eveningOpen', 'eveningClose'] as const).map((k) => (
                    <input key={k} type="time" aria-label={`${h.day} ${k}`} className="border border-line rounded-md px-1.5 py-1.5 text-xs bg-white min-w-0" value={h[k] ?? ''} onChange={(e) => setHour(i, { [k]: e.target.value } as Partial<Hours>)} />
                  ))}
                </div>
              )}
              <label className="col-span-4 sm:col-span-3 flex items-center gap-1.5 text-xs text-muted justify-end">
                <input type="checkbox" checked={!!h.byAppointment} onChange={(e) => setHour(i, { byAppointment: e.target.checked })} className="accent-[#252522]" /> By appointment
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Social media" wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SOCIALS.map((s) => (
            <div key={s}>
              <L htmlFor={`soc-${s}`}>{s}</L>
              <input id={`soc-${s}`} className="input" placeholder={`https://${s}.com/…`} value={d.socials?.[s] ?? ''} onChange={(e) => set('socials', { ...(d.socials ?? {}), [s]: e.target.value })} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end lg:col-span-2 sticky bottom-4 z-10">
        <button onClick={save} disabled={saving} className={`${btnPrimary} shadow-[0_8px_24px_rgba(37,37,34,0.18)]`}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save settings
        </button>
      </div>

      <Card title="Branding & logo" icon={<Palette size={17} className="text-bronze" />}>
        <div className="flex items-center gap-4 p-4 bg-ink text-ivory rounded-md mb-4">
          <span className="font-display text-3xl tracking-[0.18em]">{brand.wordmark}</span>
          <span className="text-[9px] uppercase tracking-[0.28em] text-bronze">{brand.descriptor}</span>
        </div>
        <Row k="Brand name" v={brand.name} />
        <Row k="Wordmark" v={brand.wordmark} />
        <Row k="Site URL" v={brand.siteUrl} />
        <p className="text-[11px] text-muted mt-3 leading-relaxed">
          The wordmark logo, email sender name and SEO defaults come from environment variables
          <code> NEXT_PUBLIC_BRAND_NAME</code>, <code>NEXT_PUBLIC_BRAND_WORDMARK</code> and <code>SITE_URL</code> (see <code>lib/brand.ts</code>).
          The studio name above overrides it on website pages.
        </p>
      </Card>

      <Card title="Email configuration" icon={<Mail size={17} className="text-bronze" />}>
        <div className={`flex items-center gap-2 text-sm font-semibold mb-3 ${mail.configured ? 'text-olive' : 'text-rust'}`}>
          {mail.configured ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {mail.configured ? 'Email sending is configured' : 'Email sending is not configured'}
        </div>
        <Row k="Sender name" v={mail.senderName} />
        <Row k="Sending mailbox" v={mail.sender || '—'} />
        <Row k="Enquiry alerts go to" v={mail.notifyOverride ? 'STUDIO_NOTIFY_EMAIL' : 'Sending mailbox'} />
        <p className="text-[11px] text-muted mt-3 leading-relaxed">
          Credentials live in server environment variables (<code>GMAIL_USER</code>, <code>GMAIL_APP_PASSWORD</code>) and are never shown here.
          Change them in your hosting provider’s environment settings.
        </p>
      </Card>

      <Card title="Users, roles & permissions" wide icon={<ShieldCheck size={17} className="text-bronze" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="md:col-span-1 bg-ivory border border-line rounded-md p-4">
            <p className="label">Current access</p>
            <p className="text-ink font-semibold mt-1.5">Super Admin</p>
            <p className="text-xs text-muted mt-1">Full access to every module. Protected by a single password (<code>ADMIN_PASSWORD</code>) and a signed session cookie.</p>
          </div>
          <div className="md:col-span-2 text-muted leading-relaxed">
            <p>
              This dashboard currently supports one shared administrator login. To revoke access, change <code>ADMIN_PASSWORD</code>
              (and optionally <code>SESSION_SECRET</code> to sign everyone out) in the server environment.
            </p>
            <p className="mt-2">
              Individual user accounts with roles (e.g. Principal, Architect, Project Manager, Content Editor) would need new backend work —
              a users table, password hashing and per-route permission checks. It hasn’t been added, so access is not over-promised here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
