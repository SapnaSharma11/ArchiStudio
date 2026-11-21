import nodemailer from 'nodemailer'
import { generateConfirmToken } from '@/lib/token'
import { BRAND } from '@/lib/brand'

/**
 * Studio email notifications (Gmail SMTP via nodemailer).
 *
 * Env (unchanged structure — see .env.example):
 *   GMAIL_USER / GMAIL_APP_PASSWORD  — the sending mailbox (account credentials)
 *   STUDIO_NOTIFY_EMAIL (optional)   — where new-enquiry alerts go; defaults to GMAIL_USER
 *   NEXT_PUBLIC_STUDIO_PHONE / STUDIO_PUBLIC_EMAIL / STUDIO_ADDRESS (optional) — shown in footers
 *
 * The HTML builders are pure functions so /email-preview can render them.
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const STUDIO_PHONE = process.env.NEXT_PUBLIC_STUDIO_PHONE ?? process.env.NEXT_PUBLIC_CLINIC_PHONE ?? ''
const STUDIO_EMAIL = process.env.STUDIO_PUBLIC_EMAIL ?? ''
const STUDIO_ADDRESS = process.env.STUDIO_ADDRESS ?? ''
const SITE_URL = BRAND.siteUrl

export type EnquiryDetails = {
  fullName: string
  phone: string
  email: string
  projectType?: string | null
  budget?: string | null
  location?: string | null
  problem: string
  preferredDate: string
  preferredTime: string
  notes?: string | null
}

/** Escape user-provided text before interpolating into HTML email bodies. */
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const C = { ink: '#252522', bronze: '#B49A7A', ivory: '#F5F3EE', line: '#E4DFD6', muted: '#77736D', text: '#242424' }
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = 'Helvetica,Arial,sans-serif'

function header(): string {
  return `
  <tr>
    <td style="background:${C.ink};padding:22px 32px">
      <span style="font-family:${SERIF};font-size:20px;letter-spacing:0.18em;color:#ffffff">${esc(BRAND.wordmark)}</span>
      <span style="font-family:${SANS};font-size:10px;letter-spacing:0.2em;color:${C.bronze};text-transform:uppercase;padding-left:10px">${esc(BRAND.descriptor)}</span>
    </td>
  </tr>`
}

function signature(): string {
  return `
  <tr>
    <td style="padding:8px 32px 24px">
      <p style="margin:0;font-size:13px;color:${C.muted};font-family:${SANS}">Warm regards,</p>
      <p style="margin:4px 0 0;font-size:16px;color:${C.ink};font-family:${SERIF}">The ${esc(BRAND.name)} team</p>
    </td>
  </tr>`
}

function footer(): string {
  const contact = [STUDIO_PHONE, STUDIO_EMAIL, SITE_URL.replace(/^https?:\/\//, '')].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')
  return `
  <tr>
    <td style="padding:18px 32px 22px;border-top:1px solid ${C.line};background:${C.ivory}">
      <p style="margin:0;font-size:11px;color:${C.muted};font-family:${SANS};line-height:1.8;letter-spacing:0.02em">
        ${esc(BRAND.name)} — ${esc(BRAND.tagline)}<br/>
        ${STUDIO_ADDRESS ? `${esc(STUDIO_ADDRESS)}<br/>` : ''}${contact}
      </p>
    </td>
  </tr>`
}

function wrap(rows: string, withSignature = false): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#ffffff;font-family:${SANS};max-width:600px;border:1px solid ${C.line}">
      <tbody>
        ${header()}
        ${rows}
        ${withSignature ? signature() : ''}
        ${footer()}
      </tbody>
    </table>`
}

function row(label: string, value: string, highlight = false): string {
  return `
    <tr style="background:${highlight ? C.ivory : '#ffffff'}">
      <td style="padding:11px 16px;font-size:10px;font-weight:700;color:${C.muted};width:130px;border-bottom:1px solid ${C.line};font-family:${SANS};letter-spacing:0.12em;text-transform:uppercase;vertical-align:top">${label}</td>
      <td style="padding:11px 16px;font-size:14px;color:${C.text};border-bottom:1px solid ${C.line};font-family:${SANS};line-height:1.6">${value}</td>
    </tr>`
}

function heading(kicker: string, title: string): string {
  return `
    <tr>
      <td style="padding:30px 32px 6px">
        <p style="margin:0 0 6px;font-size:10px;color:${C.bronze};text-transform:uppercase;letter-spacing:0.22em;font-weight:700;font-family:${SANS}">${kicker}</p>
        <h2 style="margin:0;font-size:26px;color:${C.ink};font-family:${SERIF};font-weight:400">${title}</h2>
      </td>
    </tr>`
}

// ── Builders ────────────────────────────────────────────────────────────────

export function buildOwnerEnquiryEmail(d: EnquiryDetails, confirmUrl: string) {
  const date = longDate(d.preferredDate)
  const html = wrap(`
    ${heading('New enquiry', 'Consultation request')}
    <tr>
      <td style="padding:16px 32px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-bottom:0">
          <tbody>
            ${row('Name', `<strong>${esc(d.fullName)}</strong>`)}
            ${row('Phone', esc(d.phone))}
            ${row('Email', esc(d.email))}
            ${row('Project type', esc(d.projectType || '—'))}
            ${row('Location', esc(d.location || '—'))}
            ${row('Budget', esc(d.budget || '—'))}
            ${row('Consultation', `<strong>${esc(date)} · ${esc(d.preferredTime)}</strong>`, true)}
            ${row('Project brief', esc(d.problem).replace(/\n/g, '<br/>'))}
            ${d.notes ? row('Notes', esc(d.notes)) : ''}
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 32px 30px">
        <a href="${esc(confirmUrl)}"
           style="display:inline-block;background:${C.ink};color:#ffffff;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;font-family:${SANS}">
          Confirm consultation
        </a>
        <p style="margin:10px 0 0;font-size:12px;color:${C.muted};font-family:${SANS}">
          Confirming marks the consultation as booked and emails the client automatically.
        </p>
      </td>
    </tr>
  `)
  return {
    subject: `New enquiry: ${d.fullName} — ${d.projectType || 'Project'} (${date})`,
    html,
    text: `New consultation request from ${d.fullName}\nPhone: ${d.phone}\nEmail: ${d.email}\nProject: ${d.projectType ?? '—'} · ${d.location ?? '—'} · Budget ${d.budget ?? '—'}\nPreferred: ${date} at ${d.preferredTime}\n\n${d.problem}\n\nConfirm: ${confirmUrl}`,
  }
}

export function buildClientConfirmationEmail(d: { fullName: string; preferredDate: string; preferredTime: string }) {
  const date = longDate(d.preferredDate)
  const html = wrap(`
    ${heading('Consultation confirmed', 'We look forward to meeting you')}
    <tr>
      <td style="padding:12px 32px 22px">
        <p style="margin:0 0 14px;font-size:15px;color:${C.text};line-height:1.7;font-family:${SANS}">Dear ${esc(d.fullName)},</p>
        <p style="margin:0 0 20px;font-size:15px;color:${C.text};line-height:1.7;font-family:${SANS}">
          Thank you for reaching out. Your design consultation is confirmed for:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ivory};border-left:3px solid ${C.bronze}">
          <tbody><tr><td style="padding:18px 22px">
            <p style="margin:0;font-size:20px;color:${C.ink};font-family:${SERIF}">${esc(date)}</p>
            <p style="margin:6px 0 0;font-size:14px;color:${C.muted};font-family:${SANS};letter-spacing:0.04em">${esc(d.preferredTime)}</p>
          </td></tr></tbody>
        </table>
        <p style="margin:20px 0 0;font-size:14px;color:${C.muted};line-height:1.8;font-family:${SANS}">
          If you have a site plan, photographs or reference images, please bring them along or reply to this email with them.
          ${STUDIO_PHONE ? `Need to reschedule? Call us on <strong style="color:${C.ink}">${esc(STUDIO_PHONE)}</strong>.` : 'Need to reschedule? Simply reply to this email.'}
        </p>
      </td>
    </tr>
  `, true)
  return {
    subject: `Consultation confirmed — ${date} at ${d.preferredTime}`,
    html,
    text: `Dear ${d.fullName}, your design consultation with ${BRAND.name} is confirmed for ${date} at ${d.preferredTime}.${STUDIO_PHONE ? ` To reschedule call ${STUDIO_PHONE}.` : ''}\n\nWarm regards,\nThe ${BRAND.name} team`,
  }
}

export function buildFollowUpEmail(d: { fullName: string; preferredDate: string; preferredTime: string }) {
  const date = longDate(d.preferredDate)
  const html = wrap(`
    ${heading('Following up', 'Sorry we haven’t been in touch yet')}
    <tr>
      <td style="padding:12px 32px 22px">
        <p style="margin:0 0 14px;font-size:15px;color:${C.text};line-height:1.7;font-family:${SANS}">Dear ${esc(d.fullName)},</p>
        <p style="margin:0 0 14px;font-size:15px;color:${C.text};line-height:1.7;font-family:${SANS}">
          You asked for a consultation on <strong>${esc(date)} at ${esc(d.preferredTime)}</strong>, and we weren’t able to confirm it in time.
          We’re sorry about that — every enquiry matters to us.
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:${C.text};line-height:1.7;font-family:${SANS}">
          Simply reply to this email with a couple of times that suit you and we’ll prioritise your consultation.
        </p>
        ${STUDIO_PHONE ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ivory};border-left:3px solid ${C.bronze}">
          <tbody><tr><td style="padding:16px 22px">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.18em;font-family:${SANS}">Or call the studio</p>
            <p style="margin:0;font-size:20px;color:${C.ink};font-family:${SERIF}">${esc(STUDIO_PHONE)}</p>
          </td></tr></tbody>
        </table>` : ''}
      </td>
    </tr>
  `, true)
  return {
    subject: `Your consultation request — let’s find a new time`,
    html,
    text: `Dear ${d.fullName}, we weren't able to confirm your consultation for ${date} at ${d.preferredTime}. Reply with a few times that suit you and we'll prioritise it.\n\nWarm regards,\nThe ${BRAND.name} team`,
  }
}

// ── Senders ─────────────────────────────────────────────────────────────────

function mailReady(): string | null {
  const user = process.env.GMAIL_USER
  return user && process.env.GMAIL_APP_PASSWORD ? user : null
}

/** Notify the studio inbox about a new enquiry (with a one-click confirm link). */
export async function notifyOwnerNewBooking(bookingId: number, details: EnquiryDetails): Promise<void> {
  const from = mailReady()
  if (!from) return
  const to = process.env.STUDIO_NOTIFY_EMAIL || from
  const token = generateConfirmToken(bookingId)
  const confirmUrl = `${SITE_URL}/api/bookings/${bookingId}/confirm?token=${token}`
  const mail = buildOwnerEnquiryEmail(details, confirmUrl)
  try {
    await transporter.sendMail({ from: `"${BRAND.name} Website" <${from}>`, to, replyTo: details.email, ...mail })
  } catch {
    console.error('Studio enquiry notification email failed')
  }
}

/** Email the client that their consultation is confirmed. */
export async function sendPatientConfirmation(details: {
  toEmail: string
  fullName: string
  preferredDate: string
  preferredTime: string
}): Promise<void> {
  const from = mailReady()
  if (!from) return
  const mail = buildClientConfirmationEmail(details)
  try {
    await transporter.sendMail({ from: `"${BRAND.name}" <${from}>`, to: details.toEmail, ...mail })
  } catch {
    console.error('Client confirmation email failed')
  }
}

/** Email the client when an enquiry lapsed without being confirmed (daily cron). */
export async function sendPatientApology(details: {
  toEmail: string
  fullName: string
  preferredDate: string
  preferredTime: string
}): Promise<void> {
  const from = mailReady()
  if (!from) return
  const mail = buildFollowUpEmail(details)
  try {
    await transporter.sendMail({ from: `"${BRAND.name}" <${from}>`, to: details.toEmail, ...mail })
  } catch {
    console.error('Client follow-up email failed')
  }
}

/** Domain-named aliases (the original names are kept for existing callers). */
export const notifyStudioNewEnquiry = notifyOwnerNewBooking
export const sendClientConfirmation = sendPatientConfirmation
export const sendClientFollowUp = sendPatientApology

/** Non-secret mail configuration status for the dashboard settings page. */
export function mailStatus() {
  const user = process.env.GMAIL_USER ?? ''
  const masked = user ? user.replace(/^(.{2}).*(@.*)$/, '$1•••$2') : ''
  return {
    configured: Boolean(mailReady()),
    sender: masked,
    notifyOverride: Boolean(process.env.STUDIO_NOTIFY_EMAIL),
    senderName: BRAND.name,
  }
}
