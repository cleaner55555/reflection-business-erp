import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// jose requires Web Crypto API which is not available in jsdom by default
// We test the module structure and error handling only
describe('JWT', () => {
  it('throws when JWT_SECRET is not set', async () => {
    const original = process.env.JWT_SECRET
    delete process.env.JWT_SECRET

    // Need to reimport to get fresh module - use dynamic import
    const { signToken } = await import('./jwt')
    await expect(signToken({
      userId: '1',
      email: 't@t.com',
      isSuperAdmin: false,
    })).rejects.toThrow('JWT_SECRET environment variable is not set')

    process.env.JWT_SECRET = original
  })

  it('throws when verifying an invalid token', async () => {
    const original = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'test-secret-key-for-vitest-minimum-32chars!!'

    const { verifyToken } = await import('./jwt')
    await expect(verifyToken('invalid-token')).rejects.toThrow()

    process.env.JWT_SECRET = original
  })

  it('throws when verifying an empty token', async () => {
    const original = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'test-secret-key-for-vitest-minimum-32chars!!'

    const { verifyToken } = await import('./jwt')
    await expect(verifyToken('')).rejects.toThrow()

    process.env.JWT_SECRET = original
  })
})
