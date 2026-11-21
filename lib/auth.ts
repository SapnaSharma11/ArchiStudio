import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Lightweight single-admin auth.
 *
 * - Password lives in env (`ADMIN_PASSWORD`) — rotate it anytime to revoke access.
 * - On login we set a signed, httpOnly session cookie (HMAC over an expiry).
 * - Every admin page calls `requireAdmin()`; every admin API calls `requireAdminApi()`.
 *   The cookie value is unforgeable without `SESSION_SECRET`, so direct URL / curl
 *   access is denied even though `proxy.ts` only does an optimistic presence check.
 *
 * This module is server-only (uses Node crypto + next/headers) — never import it
 * into `proxy.ts` (edge) or client components.
 */

export const SESSION_COOKIE = 'admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  return process.env.SESSION_SECRET ?? 'dev-insecure-session-secret-change-me'
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** Build a `base64url(payload).signature` token carrying an expiry timestamp. */
function createToken(expMs: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expMs })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** Validate signature + expiry. */
function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  if (!safeEqual(sig, sign(payload))) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    return typeof exp === 'number' && Date.now() < exp
  } catch {
    return false
  }
}

/** Constant-time check of a submitted password against `ADMIN_PASSWORD`. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    console.warn('[auth] ADMIN_PASSWORD is not set — login is disabled.')
    return false
  }
  // Hash both sides first so the compare is constant-time regardless of length.
  const hi = createHmac('sha256', secret()).update(input).digest('hex')
  const he = createHmac('sha256', secret()).update(expected).digest('hex')
  return safeEqual(hi, he)
}

/** Set the session cookie. Call only from a Route Handler / Server Action. */
export async function createSession(): Promise<void> {
  const token = createToken(Date.now() + MAX_AGE_SECONDS * 1000)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Returns true if the current request carries a valid admin session. */
export async function getSession(): Promise<boolean> {
  const store = await cookies()
  return verifyToken(store.get(SESSION_COOKIE)?.value)
}

/** For Server Components / layouts: redirect to /login if not authenticated. */
export async function requireAdmin(): Promise<void> {
  if (!(await getSession())) redirect('/login')
}

/** For Route Handlers: returns a 401 Response if not authenticated, else null. */
export async function requireAdminApi(): Promise<Response | null> {
  if (!(await getSession())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
