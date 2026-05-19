import { describe, it, expect } from 'vitest'
import { COUNTRY_TAX_LAWS, getTaxLaw, calculateVAT, getCurrencySymbol } from './index'

describe('Tax Laws', () => {
  it('has at least 25 countries', () => {
    expect(COUNTRY_TAX_LAWS.length).toBeGreaterThanOrEqual(25)
  })
  it('Serbia has correct VAT rate', () => {
    const rs = getTaxLaw('RS')
    expect(rs).toBeDefined()
    expect(rs!.vat.standardRate).toBe(20)
    expect(rs!.currency).toBe('RSD')
  })
  it('returns undefined for unknown country', () => {
    expect(getTaxLaw('XX')).toBeUndefined()
  })
  it('calculates VAT correctly', () => {
    const result = calculateVAT(1000, 'RS')
    expect(result.gross).toBe(1000)
    expect(result.tax).toBeCloseTo(166.67, 0)
    expect(result.net).toBeCloseTo(833.33, 0)
  })
  it('getCurrencySymbol works', () => {
    expect(getCurrencySymbol('RSD')).toBe('дин')
    expect(getCurrencySymbol('EUR')).toBe('€')
    expect(getCurrencySymbol('USD')).toBe('$')
  })
  it('all countries have valid regions', () => {
    const regions = ['europe', 'americas', 'asia', 'africa', 'oceania']
    for (const law of COUNTRY_TAX_LAWS) {
      expect(regions).toContain(law.region)
    }
  })
})
