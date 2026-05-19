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

  // --- Additional tests ---

  it('all countries have unique codes', () => {
    const codes = COUNTRY_TAX_LAWS.map(c => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('all countries have required top-level fields', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.code).toBeTruthy()
      expect(law.name).toBeTruthy()
      expect(law.flag).toBeTruthy()
      expect(law.currency).toBeTruthy()
      expect(law.region).toBeTruthy()
    }
  })

  it('all countries have valid VAT configuration', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.vat).toBeDefined()
      expect(typeof law.vat.standardRate).toBe('number')
      expect(law.vat.standardRate).toBeGreaterThanOrEqual(0)
      expect(law.vat.standardRate).toBeLessThanOrEqual(30)
      expect(Array.isArray(law.vat.reducedRates)).toBe(true)
      expect(Array.isArray(law.vat.exemptions)).toBe(true)
    }
  })

  it('all countries have corporate tax rate', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(typeof law.corporateTax.rate).toBe('number')
      expect(law.corporateTax.rate).toBeGreaterThanOrEqual(0)
    }
  })

  it('all countries have income tax configuration', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.incomeTax).toBeDefined()
      expect(['progressive', 'flat', 'none']).toContain(law.incomeTax.type)
    }
  })

  it('all countries have social contributions', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.socialContributions).toBeDefined()
      expect(typeof law.socialContributions.totalEmployee).toBe('number')
      expect(typeof law.socialContributions.totalEmployer).toBe('number')
    }
  })

  it('all countries have withholding tax', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.withholdingTax).toBeDefined()
      expect(typeof law.withholdingTax.dividends).toBe('number')
      expect(typeof law.withholdingTax.interest).toBe('number')
      expect(typeof law.withholdingTax.royalties).toBe('number')
    }
  })

  it('all countries have payroll configuration', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.payroll).toBeDefined()
      expect(typeof law.payroll.minimumWage).toBe('number')
      expect(typeof law.payroll.annualLeaveDays).toBe('number')
      expect(law.payroll.pensionAge.male).toBeGreaterThan(0)
      expect(law.payroll.pensionAge.female).toBeGreaterThan(0)
    }
  })

  it('all countries have tax forms', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(Array.isArray(law.taxForms)).toBe(true)
      expect(law.taxForms.length).toBeGreaterThan(0)
      for (const form of law.taxForms) {
        expect(form.code).toBeTruthy()
        expect(form.name).toBeTruthy()
        expect(form.frequency).toBeTruthy()
        expect(form.description).toBeTruthy()
      }
    }
  })

  it('EU countries have isEuVat=true', () => {
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'CZ', 'HR']
    for (const code of euCountries) {
      const law = getTaxLaw(code)
      expect(law).toBeDefined()
      expect(law!.vat.isEuVat).toBe(true)
    }
  })

  it('non-EU European countries have isEuVat=false', () => {
    const nonEu = ['RS', 'GB', 'BA', 'MK', 'ME']
    for (const code of nonEu) {
      const law = getTaxLaw(code)
      if (law) {
        expect(law.vat.isEuVat).toBe(false)
      }
    }
  })

  it('Germany has correct VAT rate of 19%', () => {
    const de = getTaxLaw('DE')
    expect(de).toBeDefined()
    expect(de!.vat.standardRate).toBe(19)
    expect(de!.currency).toBe('EUR')
  })

  it('UK has VAT rate of 20% and currency GBP', () => {
    const gb = getTaxLaw('GB')
    expect(gb).toBeDefined()
    expect(gb!.vat.standardRate).toBe(20)
    expect(gb!.currency).toBe('GBP')
  })

  it('Serbia has flat income tax', () => {
    const rs = getTaxLaw('RS')
    expect(rs!.incomeTax.type).toBe('flat')
    expect(rs!.incomeTax.flatRate).toBe(10)
  })

  it('calculateVAT returns zero tax for "none" VAT type country', () => {
    // Find a country with no VAT
    const noVat = COUNTRY_TAX_LAWS.find(c => c.vat.type === 'none')
    if (noVat) {
      const result = calculateVAT(1000, noVat.code)
      expect(result.tax).toBe(0)
      expect(result.gross).toBe(1000)
    }
  })

  it('calculateVAT with reduced rate uses the first reduced rate', () => {
    const rs = getTaxLaw('RS')
    expect(rs!.vat.reducedRates.length).toBeGreaterThan(0)
    const reducedRate = rs!.vat.reducedRates[0].rate
    const result = calculateVAT(1000, 'RS', 'reduced')
    expect(result.rate).toBe(reducedRate)
  })

  it('getCurrencySymbol returns the code itself for unknown currency', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ')
  })

  it('all countries have accounting standards defined', () => {
    for (const law of COUNTRY_TAX_LAWS) {
      expect(law.accounting).toBeDefined()
      expect(law.accounting.standards).toBeTruthy()
      expect(['calendar', 'custom']).toContain(law.accounting.fiscalYear)
    }
  })
})
