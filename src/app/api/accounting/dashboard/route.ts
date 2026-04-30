import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || String(new Date().getFullYear())

    const fiscalYear = parseInt(year)
    const startDate = new Date(fiscalYear, 0, 1)
    const endDate = new Date(fiscalYear, 11, 31, 23, 59, 59)

    // Get all accounts with their entries for the fiscal year
    const accounts = await db.account.findMany({
      where: { isActive: true },
      include: {
        entries: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
          select: { debit: true, credit: true },
        },
      },
    })

    let totalAssets = 0
    let totalLiabilities = 0
    let totalRevenue = 0
    let totalExpenses = 0
    let totalEquity = 0

    for (const acc of accounts) {
      const netDebit = acc.entries.reduce((s, e) => s + (e.debit || 0), 0)
      const netCredit = acc.entries.reduce((s, e) => s + (e.credit || 0), 0)
      const saldo = netDebit - netCredit

      switch (acc.type) {
        case 'aktivna':
          totalAssets += saldo
          break
        case 'pasivna':
          totalLiabilities += -saldo // liabilities are credit-normal
          // Capital accounts (class 0, 01x) count as equity
          if (acc.code.startsWith('01')) totalEquity += -saldo
          break
        case 'prihodka':
          totalRevenue += netCredit
          break
        case 'rashodna':
          totalExpenses += netDebit
          break
      }
    }

    // Count totals
    const totalEntries = await db.journalEntry.count({
      where: { date: { gte: startDate, lte: endDate } },
    })

    const totalAccounts = accounts.length

    // Get recent entries
    const recentEntries = await db.journalEntry.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: {
        account: { select: { code: true, name: true } },
        partner: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    })

    const profit = totalRevenue - totalExpenses

    // Budget summary
    const budgets = await db.budget.findMany({
      where: { year: fiscalYear },
    })
    const totalBudget = budgets.reduce((s, b) => s + (b.totalAnnual || 0), 0)

    return NextResponse.json({
      fiscalYear,
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      totalEquity: Math.round(totalEquity * 100) / 100,
      totalEntries,
      totalAccounts,
      totalBudget: Math.round(totalBudget * 100) / 100,
      budgetCount: budgets.length,
      recentEntries: recentEntries.map(e => ({
        ...e,
        accountCode: e.account?.code || '',
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
