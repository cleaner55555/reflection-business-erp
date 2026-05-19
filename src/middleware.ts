import { NextRequest, NextResponse } from 'next/server'

// Routes that are always public
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/seed', '/api/health', '/api/industry-templates']

// Security headers for all responses
function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

// CSP for non-API routes
function getCspHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss: https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  }
}

// Cleanup old entries every 60 seconds
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) rateLimitStore.delete(key)
  })
}, 60_000)

function checkApiRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = 200 // 200 req/min for API
  const windowMs = 60_000
  const now = Date.now()

  const entry = rateLimitStore.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const response = NextResponse.next()

  // ── Security headers for all responses ──
  const securityHeaders = getSecurityHeaders()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  // ── CSP for page routes (not API) ──
  if (!pathname.startsWith('/api/')) {
    const cspHeaders = getCspHeaders()
    for (const [key, value] of Object.entries(cspHeaders)) {
      response.headers.set(key, value)
    }
  }

  // ── Non-API routes: just add headers ──
  if (!pathname.startsWith('/api/')) {
    return response
  }

  // ── Health check: always public, no rate limit ──
  if (pathname === '/api/health') {
    return response
  }

  // ── Allow public API routes ──
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      // Still apply rate limiting to auth routes
      if (prefix === '/api/auth') {
        const ip = getClientIp(req)
        const rl = checkApiRateLimit(ip)
        response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)))
        if (!rl.allowed) {
          return NextResponse.json(
            { error: 'Previše zahteva. Pokušajte ponovo kasnije.' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                ...securityHeaders,
              },
            }
          )
        }
      }
      return response
    }
  }

  // ── API rate limiting ──
  const ip = getClientIp(req)
  const rl = checkApiRateLimit(ip)
  response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)))

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Pokušajte ponovo kasnije.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          ...securityHeaders,
        },
      }
    )
  }

  // ── JWT token extraction ──
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
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

  return response
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.json).*)'],
}
