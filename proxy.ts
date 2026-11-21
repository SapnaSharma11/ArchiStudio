import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next 16 renamed `middleware` -> `proxy`. This runs on the edge before routes,
// so it must NOT import `lib/auth` (Node crypto). It only does an OPTIMISTIC
// session-presence check; the authoritative HMAC verification happens in
// `requireAdmin()` / `requireAdminApi()` on every dashboard page and admin API.
const SESSION_COOKIE = 'admin_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)

  if (pathname.startsWith('/dashboard')) {
    if (!request.cookies.has(SESSION_COOKIE)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|videos|.*\\..*).*)'],
}
