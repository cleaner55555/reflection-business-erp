import { NextResponse } from 'next/server'
import { calculateVAT, calculateIncomeTax, calculateEmployerCost } from '@/lib/tax-laws'

// POST /api/tax-laws/calculate - Calculate taxes
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, countryCode, amount, grossSalary } = body

    if (!countryCode) {
      return NextResponse.json({ error: 'countryCode is required' }, { status: 400 })
    }

    switch (type) {
      case 'vat': {
        if (!amount) return NextResponse.json({ error: 'amount is required' }, { status: 400 })
        const rateType = body.rateType || 'standard'
        const result = calculateVAT(amount, countryCode, rateType)
        return NextResponse.json({ ...result, countryCode })
      }

      case 'incomeTax': {
        if (!grossSalary) return NextResponse.json({ error: 'grossSalary is required' }, { status: 400 })
        const income = calculateIncomeTax(grossSalary, countryCode)
        const employer = calculateEmployerCost(grossSalary, countryCode)
        return NextResponse.json({ income, employer, countryCode })
      }

      default:
        return NextResponse.json({ error: 'Invalid calculation type. Use: vat, incomeTax' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}
