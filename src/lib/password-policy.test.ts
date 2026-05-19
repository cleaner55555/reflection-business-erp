import { describe, it, expect } from 'vitest'
import { validatePassword, getPasswordStrengthLabel } from './password-policy'

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('Ab1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Lozinka mora imati najmanje 8 karaktera')
  })

  it('rejects passwords without uppercase letters', () => {
    const result = validatePassword('abcdef1!')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('veliko slovo'))).toBe(true)
  })

  it('rejects passwords without lowercase letters', () => {
    const result = validatePassword('ABCDEFG1!')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('malo slovo'))).toBe(true)
  })

  it('rejects passwords without numbers', () => {
    const result = validatePassword('Abcdefgh!')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('broj'))).toBe(true)
  })

  it('rejects passwords without special characters', () => {
    const result = validatePassword('Abcdefgh1')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('specijalni'))).toBe(true)
  })

  it('accepts a valid password with all requirements', () => {
    const result = validatePassword('MyStrongP@ss1')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.strength).toBeGreaterThan(0)
  })

  it('rejects common passwords regardless of other criteria', () => {
    const result = validatePassword('password')
    expect(result.valid).toBe(false)
    expect(result.strength).toBe(0)
    expect(result.errors.some(e => e.includes('česta'))).toBe(true)
  })

  it('rejects admin123 as a common password', () => {
    const result = validatePassword('admin123')
    expect(result.valid).toBe(false)
    expect(result.strength).toBe(0)
  })

  it('rejects test as a common password', () => {
    const result = validatePassword('test')
    expect(result.valid).toBe(false)
  })

  it('penalizes sequential characters like 123', () => {
    const valid = validatePassword('GoodP@ss123')
    // Should have reduced strength due to sequential chars
    expect(valid.strength).toBeLessThan(100)
  })

  it('penalizes repeated characters like aaa', () => {
    const result = validatePassword('GooooodP@ss1')
    expect(result.strength).toBeLessThan(100)
  })

  it('gives higher strength for longer passwords', () => {
    const short = validatePassword('ShortP@ss1')
    const long = validatePassword('MuchLongerP@ssword123')
    expect(long.strength).toBeGreaterThan(short.strength)
  })

  it('capped strength at 100', () => {
    const result = validatePassword('ExtremelyLongAndComplexP@ssw0rd!!2024')
    expect(result.strength).toBeLessThanOrEqual(100)
  })

  it('strength is at least 0 for invalid passwords', () => {
    const result = validatePassword('')
    expect(result.strength).toBeGreaterThanOrEqual(0)
  })
})

describe('getPasswordStrengthLabel', () => {
  it('returns "Veoma slaba" for strength < 25', () => {
    const { label, color } = getPasswordStrengthLabel(0)
    expect(label).toBe('Veoma slaba')
    expect(color).toBe('text-red-500')
  })

  it('returns "Slaba" for strength < 50', () => {
    const { label, color } = getPasswordStrengthLabel(30)
    expect(label).toBe('Slaba')
    expect(color).toBe('text-orange-500')
  })

  it('returns "Srednja" for strength < 75', () => {
    const { label, color } = getPasswordStrengthLabel(60)
    expect(label).toBe('Srednja')
    expect(color).toBe('text-yellow-500')
  })

  it('returns "Dobra" for strength < 90', () => {
    const { label, color } = getPasswordStrengthLabel(80)
    expect(label).toBe('Dobra')
    expect(color).toBe('text-green-500')
  })

  it('returns "Odlična" for strength >= 90', () => {
    const { label, color } = getPasswordStrengthLabel(95)
    expect(label).toBe('Odlična')
    expect(color).toBe('text-emerald-500')
  })

  it('handles boundary value at 25', () => {
    const { label } = getPasswordStrengthLabel(25)
    expect(label).toBe('Slaba')
  })

  it('handles boundary value at 50', () => {
    const { label } = getPasswordStrengthLabel(50)
    expect(label).toBe('Srednja')
  })

  it('handles boundary value at 75', () => {
    const { label } = getPasswordStrengthLabel(75)
    expect(label).toBe('Dobra')
  })

  it('handles boundary value at 90', () => {
    const { label } = getPasswordStrengthLabel(90)
    expect(label).toBe('Odlična')
  })
})
