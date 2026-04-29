import { NextResponse } from 'next/server'
import { COUNTRY_TAX_LAWS, getTaxLaw, calculateVAT, calculateIncomeTax, calculateEmployerCost, getCountriesByRegion, searchCountries, getInvoiceMandatoryFields, getTaxForms } from '@/lib/tax-laws'

// GET /api/tax-laws - List all countries or search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''
    const code = searchParams.get('code') || ''

    // Single country by code
    if (code) {
      const law = getTaxLaw(code)
      if (!law) {
        return NextResponse.json({ error: 'Country not found' }, { status: 404 })
      }
      return NextResponse.json(law)
    }

    // Search by query
    let countries = COUNTRY_TAX_LAWS
    if (search) {
      countries = searchCountries(search)
    }
    if (region && region !== 'all') {
      countries = countries.filter(c => c.region === region)
    }

    // Return lightweight list (no full details)
    const list = countries.map(c => ({
      code: c.code,
      name: c.name,
      flag: c.flag,
      currency: c.currency,
      region: c.region,
      vatRate: c.vat.standardRate,
      corporateTaxRate: c.corporateTax.rate,
      totalEmployeeContrib: c.socialContributions.totalEmployee,
      totalEmployerContrib: c.socialContributions.totalEmployer,
      minimumWage: c.payroll.minimumWage,
      eInvoiceSystem: c.invoiceRequirements.eInvoiceSystem,
      fiscalization: c.invoiceRequirements.fiscalization,
    }))

    return NextResponse.json({ countries: list, total: list.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tax laws' }, { status: 500 })
  }
}
