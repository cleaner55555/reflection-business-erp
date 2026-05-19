import { NextRequest, NextResponse } from 'next/server'

// Routes that are always public
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/seed', '/api/health', '/api/industry-templates']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public API routes without any checks
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next()
    }
  }

  // Soft mode: pass through all requests
  // JWT verification is available via /api/auth/me endpoint
  // Individual API routes can check x-user-* headers if needed
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Token present - decode base64 payload to get user info (JWT format: header.payload.signature)
    try {
      const token = authHeader.substring(7)
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        const requestHeaders = new Headers(req.headers)
        if (payload.userId) requestHeaders.set('x-user-id', payload.userId)
        if (payload.email) requestHeaders.set('x-user-email', payload.email)
        requestHeaders.set('x-is-super-admin', String(payload.isSuperAdmin === true))
        requestHeaders.set('x-auth-verified', 'true')
        return NextResponse.next({ request: { headers: requestHeaders } })
      }
    } catch {
      // Invalid token format - pass through anyway
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
