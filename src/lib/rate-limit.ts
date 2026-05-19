// ─── In-memory Rate Limiter ────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 60_000)

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now()

  const entry = store.get(key)
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

// Pre-configured rate limiters
export const authLimiter = (key: string) => rateLimit(key, 5, 60_000) // 5 req/min
export const registerLimiter = (key: string) => rateLimit(key, 3, 60_000) // 3 req/min
export const forgotLimiter = (key: string) => rateLimit(key, 3, 300_000) // 3 per 5min
export const apiLimiter = (key: string) => rateLimit(key, 100, 60_000) // 100 req/min
export const uploadLimiter = (key: string) => rateLimit(key, 10, 60_000) // 10 uploads/min

// Helper to extract IP from NextRequest
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}
