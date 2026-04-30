import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountCode = searchParams.get('accountCode')
    const accountId = searchParams.get('accountId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const _limit = searchParams.get('_limit')
    const voucherNumber = searchParams.get('voucherNumber')
    const fiscalYear = searchParams.get('fiscalYear')

    const where: Record<string, unknown> = {}
    if (accountId) {
      where.accountId = accountId
    } else if (accountCode) {
      const account = await db.account.findFirst({ where: { code: accountCode } })
      if (account) where.accountId = account.id
    }
    if (from || to) {
      where.date = {} as Record<string, unknown>
      if (from) (where.date as Record<string, unknown>).gte = new Date(from)
      if (to) (where.date as Record<string, unknown>).lte = new Date(to + 'T23:59:59')
    }
    if (voucherNumber) where.voucherNumber = voucherNumber
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear)

    const entries = await db.journalEntry.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        account: { select: { code: true, name: true } },
        partner: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: _limit ? parseInt(_limit) : 500,
    })

    const mapped = entries.map(e => ({
      ...e,
      accountCode: e.account?.code || '',
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// Generate next voucher number for a given fiscal year
async function generateVoucherNumber(fiscalYear: number): Promise<string> {
  const yearPrefix = String(fiscalYear).slice(-2)
  const prefix = `NAL-${yearPrefix}`

  const lastEntry = await db.journalEntry.findFirst({
    where: {
      voucherNumber: { startsWith: prefix },
    },
    orderBy: { voucherNumber: 'desc' },
    select: { voucherNumber: true },
  })

  if (!lastEntry?.voucherNumber) return `${prefix}-0001`

  const parts = lastEntry.voucherNumber.split('-')
  const lastNum = parseInt(parts[parts.length - 1]) || 0
  return `${prefix}-${String(lastNum + 1).padStart(4, '0')}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountCode, debit, credit, description, documentRef, date, partnerId, fiscalYear } = body
    if (!accountCode || !description) {
      return NextResponse.json({ error: 'accountCode i description su obavezni' }, { status: 400 })
    }

    const account = await db.account.findFirst({ where: { code: accountCode } })
    if (!account) {
      return NextResponse.json({ error: `Konto ${accountCode} ne postoji` }, { status: 404 })
    }

    const entryDate = date ? new Date(date) : new Date()
    const year = fiscalYear || entryDate.getFullYear()

    const voucherNumber = await generateVoucherNumber(year)

    const entry = await db.journalEntry.create({
      data: {
        accountId: account.id,
        debit: Number(debit) || 0,
        credit: Number(credit) || 0,
        description,
        documentRef: documentRef || null,
        partnerId: partnerId || null,
        date: entryDate,
        voucherNumber,
        fiscalYear: year,
      },
      include: {
        account: { select: { code: true, name: true } },
        partner: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ ...entry, accountCode: account.code }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// Batch create for journal vouchers (nalog)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { entries } = body as { entries: Array<{
      accountCode: string
      debit: number
      credit: number
      description: string
      documentRef?: string | null
      date: string
      partnerId?: string | null
    }> }

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'Nema stavki za knjiženje' }, { status: 400 })
    }

    // Validate balance
    const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0)
    const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: `Nalog nije u ravnoteži. Razlika: ${Math.abs(totalDebit - totalCredit).toFixed(2)}` }, { status: 400 })
    }

    const entryDate = entries[0].date ? new Date(entries[0].date) : new Date()
    const year = entryDate.getFullYear()
    const voucherNumber = await generateVoucherNumber(year)

    const created = []
    for (const entry of entries) {
      const account = await db.account.findFirst({ where: { code: entry.accountCode } })
      if (!account) {
        return NextResponse.json({ error: `Konto ${entry.accountCode} ne postoji` }, { status: 404 })
      }

      const created_entry = await db.journalEntry.create({
        data: {
          accountId: account.id,
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0,
          description: entry.description,
          documentRef: entry.documentRef || null,
          partnerId: entry.partnerId || null,
          date: entry.date ? new Date(entry.date) : new Date(),
          voucherNumber,
          fiscalYear: year,
        },
        include: {
          account: { select: { code: true, name: true } },
          partner: { select: { id: true, name: true } },
        },
      })
      created.push({ ...created_entry, accountCode: account.code })
    }

    return NextResponse.json({ success: true, count: created.length, voucherNumber, entries: created })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
