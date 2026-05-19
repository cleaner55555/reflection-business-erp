import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit, authLimiter, registerLimiter, apiLimiter, uploadLimiter, getClientIp } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    // Use unique keys for each test to avoid interference
  })

  it('allows the first request', () => {
    const result = rateLimit('test-first-' + Date.now(), 5)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('counts requests correctly within the limit', () => {
    const key = 'test-count-' + Date.now()
    expect(rateLimit(key, 3).remaining).toBe(2)
    expect(rateLimit(key, 3).remaining).toBe(1)
    expect(rateLimit(key, 3).remaining).toBe(0)
  })

  it('blocks requests when limit is exceeded', () => {
    const key = 'test-block-' + Date.now()
    rateLimit(key, 2)
    rateLimit(key, 2)
    const result = rateLimit(key, 2)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfter).toBeDefined()
    expect(typeof result.retryAfter).toBe('number')
  })

  it('blocked request has retryAfter in seconds', () => {
    const key = 'test-retry-' + Date.now()
    rateLimit(key, 1, 60000)
    const blocked = rateLimit(key, 1, 60000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
    expect(blocked.remaining).toBe(0)
  })

  it('returns correct resetAt timestamp', () => {
    const key = 'test-resetat-' + Date.now()
    const before = Date.now()
    const result = rateLimit(key, 5, 60000)
    const after = Date.now()
    expect(result.resetAt).toBeGreaterThanOrEqual(before + 60000)
    expect(result.resetAt).toBeLessThanOrEqual(after + 60000)
  })

  it('retryAfter is a positive integer when blocked', () => {
    const key = 'test-retry-' + Date.now()
    rateLimit(key, 1)
    const blocked = rateLimit(key, 1, 60000)
    expect(blocked.retryAfter).toBeGreaterThan(0)
    expect(Number.isInteger(blocked.retryAfter)).toBe(true)
  })
})

describe('authLimiter', () => {
  it('allows up to 5 requests', () => {
    const key = 'auth-' + Date.now()
    for (let i = 0; i < 5; i++) {
      const result = authLimiter(key)
      expect(result.allowed).toBe(true)
    }
    const blocked = authLimiter(key)
    expect(blocked.allowed).toBe(false)
  })
})

describe('registerLimiter', () => {
  it('allows up to 3 requests', () => {
    const key = 'register-' + Date.now()
    for (let i = 0; i < 3; i++) {
      expect(registerLimiter(key).allowed).toBe(true)
    }
    expect(registerLimiter(key).allowed).toBe(false)
  })
})

describe('apiLimiter', () => {
  it('allows up to 100 requests', () => {
    const key = 'api-' + Date.now()
    for (let i = 0; i < 100; i++) {
      expect(apiLimiter(key).allowed).toBe(true)
    }
    expect(apiLimiter(key).allowed).toBe(false)
  })
})

describe('uploadLimiter', () => {
  it('allows up to 10 requests', () => {
    const key = 'upload-' + Date.now()
    for (let i = 0; i < 10; i++) {
      expect(uploadLimiter(key).allowed).toBe(true)
    }
    expect(uploadLimiter(key).allowed).toBe(false)
  })
})

describe('getClientIp', () => {
  it('returns IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('returns IP from x-real-ip header when no forwarded header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '10.0.0.1' },
    })
    expect(getClientIp(req)).toBe('10.0.0.1')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.1.1.1',
        'x-real-ip': '2.2.2.2',
      },
    })
    expect(getClientIp(req)).toBe('1.1.1.1')
  })

  it('returns "unknown" when no IP headers are present', () => {
    const req = new Request('http://localhost')
    expect(getClientIp(req)).toBe('unknown')
  })

  it('trims whitespace from forwarded IP', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  1.2.3.4  ' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })
})
