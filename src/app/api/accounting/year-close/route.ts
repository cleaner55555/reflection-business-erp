import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/accounting/year-close - Create year-end closing entries
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { year } = body
    const fiscalYear = parseInt(year || String(new Date().getFullYear()))

    const startDate = new Date(fiscalYear, 0, 1)
    const endDate = new Date(fiscalYear, 11, 31, 23, 59, 59)
    const closeDate = new Date(fiscalYear, 11, 31, 23, 59, 59)

    // Check if already closed
    const existingClose = await db.journalEntry.findFirst({
      where: {
        date: closeDate,
        description: { contains: `GODIŠNJE ZATVARANJE ${fiscalYear}` },
      },
    })
    if (existingClose) {
      return NextResponse.json({ error: `Godina ${fiscalYear} je već zatvorena` }, { status: 400 })
    }

    // Get all prihodna and rashodna accounts
    const accounts = await db.account.findMany({
      where: {
        isActive: true,
        type: { in: ['prihodka', 'rashodna'] },
      },
      include: {
        entries: {
          where: { date: { gte: startDate, lte: endDate } },
          select: { debit: true, credit: true },
        },
      },
    })

    const closingEntries: Array<{ accountId: string; debit: number; credit: number; description: string }> = []

    let totalRevenue = 0
    let totalExpenses = 0

    for (const acc of accounts) {
      const netDebit = acc.entries.reduce((s, e) => s + (e.debit || 0), 0)
      const netCredit = acc.entries.reduce((s, e) => s + (e.credit || 0), 0)
      const saldo = netCredit - netDebit // revenue = credit - debit, expense = debit - credit

      if (Math.abs(saldo) < 0.01) continue

      if (acc.type === 'prihodka') {
        totalRevenue += saldo
        // Close revenue: credit -> 0 (debit the account to close)
        closingEntries.push({
          accountId: acc.id,
          debit: Math.abs(saldo),
          credit: 0,
          description: `Zatvaranje prihoda: ${acc.code} ${acc.name}`,
        })
      } else if (acc.type === 'rashodna') {
        totalExpenses += Math.abs(saldo)
        // Close expense: debit -> 0 (credit the account to close)
        closingEntries.push({
          accountId: acc.id,
          debit: 0,
          credit: Math.abs(saldo),
          description: `Zatvaranje rashoda: ${acc.code} ${acc.name}`,
        })
      }
    }

    if (closingEntries.length === 0) {
      return NextResponse.json({ error: 'Nema prihodnih/rashodnih stavki za zatvaranje' }, { status: 400 })
    }

    // Find or create the "Dobit/Gubitak" account (code 130 - Godišnji rezultat)
    let resultAccount = await db.account.findFirst({ where: { code: '130' } })
    if (!resultAccount) {
      resultAccount = await db.account.create({
        data: {
          companyId: accounts[0]?.id ? (await db.account.findUnique({ where: { id: accounts[0].id } }))?.companyId || '' : '',
          code: '130',
          name: 'Godišnji rezultat (Dobit/Gubitak)',
          type: 'pasivna',
        },
      })
    }

    // Create closing entry for profit/loss
    const profit = totalRevenue - totalExpenses
    if (profit > 0) {
      // Profit: debit result account, credit already handled by closing revenue
      closingEntries.push({
        accountId: resultAccount.id,
        debit: 0,
        credit: profit,
        description: `GODIŠNJE ZATVARANJE ${fiscalYear}: Prenošenje dobiti`,
      })
    } else {
      // Loss: credit result account, debit already handled by closing expenses
      closingEntries.push({
        accountId: resultAccount.id,
        debit: Math.abs(profit),
        credit: 0,
        description: `GODIŠNJE ZATVARANJE ${fiscalYear}: Prenošenje gubitka`,
      })
    }

    // Generate voucher number
    const yearStr = String(fiscalYear).slice(-2)
    const count = await db.journalEntry.count()
    const voucherNumber = `ZAT-${yearStr}-${String(count + 1).padStart(4, '0')}`

    // Create all closing entries
    const created = []
    for (const entry of closingEntries) {
      const createdEntry = await db.journalEntry.create({
        data: {
          companyId: (await db.account.findUnique({ where: { id: entry.accountId } }))?.companyId || '',
          accountId: entry.accountId,
          date: closeDate,
          debit: entry.debit,
          credit: entry.credit,
          description: entry.description,
          documentRef: voucherNumber,
          voucherNumber,
          fiscalYear,
        },
      })
      created.push(createdEntry.id)
    }

    return NextResponse.json({
      success: true,
      message: `Godišnje zatvaranje ${fiscalYear} uspešno`,
      fiscalYear,
      profit: Math.round(profit * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      entriesCount: closingEntries.length,
      voucherNumber,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// GET /api/accounting/year-close?year=2025 - Check year-end status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const closeDate = new Date(year, 11, 31, 23, 59, 59)

    const closingEntries = await db.journalEntry.findMany({
      where: {
        date: closeDate,
        description: { contains: `GODIŠNJE ZATVARANJE ${year}` },
      },
      include: { account: { select: { code: true, name: true, type: true } } },
    })

    const isClosed = closingEntries.length > 0

    // Get summary of prihodna/rashodna for the year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const accounts = await db.account.findMany({
      where: {
        isActive: true,
        type: { in: ['prihodka', 'rashodna'] },
      },
      include: {
        entries: {
          where: { date: { gte: startDate, lte: endDate } },
          select: { debit: true, credit: true },
        },
      },
    })

    let totalRevenue = 0
    let totalExpenses = 0
    const revenueAccounts: Array<{ code: string; name: string; amount: number }> = []
    const expenseAccounts: Array<{ code: string; name: string; amount: number }> = []

    for (const acc of accounts) {
      const netDebit = acc.entries.reduce((s, e) => s + (e.debit || 0), 0)
      const netCredit = acc.entries.reduce((s, e) => s + (e.credit || 0), 0)

      if (acc.type === 'prihodka') {
        const amount = netCredit - netDebit
        totalRevenue += amount
        if (Math.abs(amount) >= 0.01) revenueAccounts.push({ code: acc.code, name: acc.name, amount: Math.round(amount * 100) / 100 })
      } else if (acc.type === 'rashodna') {
        const amount = netDebit - netCredit
        totalExpenses += amount
        if (Math.abs(amount) >= 0.01) expenseAccounts.push({ code: acc.code, name: acc.name, amount: Math.round(amount * 100) / 100 })
      }
    }

    return NextResponse.json({
      year,
      isClosed,
      closingEntriesCount: closingEntries.length,
      closingVoucher: closingEntries[0]?.voucherNumber || null,
      profit: Math.round((totalRevenue - totalExpenses) * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      revenueAccounts: revenueAccounts.sort((a, b) => b.amount - a.amount),
      expenseAccounts: expenseAccounts.sort((a, b) => b.amount - a.amount),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
