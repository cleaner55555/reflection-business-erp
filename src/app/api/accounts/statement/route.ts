import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountCode = searchParams.get('accountCode')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!accountCode) {
      return NextResponse.json({ error: 'accountCode je obavezan' }, { status: 400 })
    }

    const account = await db.account.findFirst({ where: { code: accountCode } })
    if (!account) {
      return NextResponse.json({ error: `Konto ${accountCode} ne postoji` }, { status: 404 })
    }

    const dateFilter: Record<string, unknown> = {}
    if (from || to) {
      if (from) dateFilter.gte = new Date(from)
      if (to) dateFilter.lte = new Date(to + 'T23:59:59')
    }

    // Get opening balance (sum of all entries before the from date)
    let openingBalance = 0
    if (from) {
      const openingEntries = await db.journalEntry.findMany({
        where: {
          accountId: account.id,
          date: { lt: new Date(from) },
        },
        select: { debit: true, credit: true },
      })
      openingBalance = openingEntries.reduce((s, e) => s + (e.debit || 0) - (e.credit || 0), 0)
    }

    const entries = await db.journalEntry.findMany({
      where: {
        accountId: account.id,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      include: {
        partner: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate running balance
    let runningBalance = openingBalance
    const entriesWithBalance = entries.map(e => {
      runningBalance += (e.debit || 0) - (e.credit || 0)
      return {
        ...e,
        accountCode: account.code,
        runningBalance: Math.round(runningBalance * 100) / 100,
      }
    })

    const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0)
    const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0)
    const closingBalance = openingBalance + totalDebit - totalCredit

    return NextResponse.json({
      account: { code: account.code, name: account.name, type: account.type },
      openingBalance: Math.round(openingBalance * 100) / 100,
      closingBalance: Math.round(closingBalance * 100) / 100,
      totalDebit,
      totalCredit,
      entryCount: entries.length,
      entries: entriesWithBalance,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
