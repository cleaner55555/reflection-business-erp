import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const accountCode = searchParams.get('accountCode')

    const where: Record<string, unknown> = {}
    if (year) where.year = parseInt(year)
    if (accountCode) where.accountCode = accountCode

    const budgets = await db.budget.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ year: 'desc' }, { accountCode: 'asc' }],
    })

    return NextResponse.json(budgets)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountCode, year, name, january, february, march, april, may, june,
            july, august, september, october, november, december, notes } = body

    if (!accountCode || !year) {
      return NextResponse.json({ error: 'accountCode i year su obavezni' }, { status: 400 })
    }

    const totalAnnual = (Number(january) || 0) + (Number(february) || 0) + (Number(march) || 0) +
      (Number(april) || 0) + (Number(may) || 0) + (Number(june) || 0) +
      (Number(july) || 0) + (Number(august) || 0) + (Number(september) || 0) +
      (Number(october) || 0) + (Number(november) || 0) + (Number(december) || 0)

    // Try to find account name
    const account = await db.account.findFirst({ where: { code: accountCode } })
    const budgetName = name || `${account?.name || accountCode} — ${year}`

    const budget = await db.budget.create({
      data: {
        accountCode,
        year: parseInt(year),
        name: budgetName,
        january: Number(january) || 0,
        february: Number(february) || 0,
        march: Number(march) || 0,
        april: Number(april) || 0,
        may: Number(may) || 0,
        june: Number(june) || 0,
        july: Number(july) || 0,
        august: Number(august) || 0,
        september: Number(september) || 0,
        october: Number(october) || 0,
        november: Number(november) || 0,
        december: Number(december) || 0,
        totalAnnual,
        notes: notes || null,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
