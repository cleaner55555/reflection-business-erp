import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const accountType = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (accountType) where.type = accountType
    const accounts = await db.account.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        _count: { select: { entries: true } },
        entries: {
          where: from || to ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + 'T23:59:59') } : {}),
            }
          } : undefined,
          select: { debit: true, credit: true },
        },
      },
      orderBy: { code: 'asc' },
    })

    const trialBalance = accounts.map(acc => {
      const totalDebit = acc.entries.reduce((s, e) => s + (e.debit || 0), 0)
      const totalCredit = acc.entries.reduce((s, e) => s + (e.credit || 0), 0)
      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        parentCode: acc.parentCode,
        entryCount: acc.entries.length,
        totalDebit,
        totalCredit,
        saldo: totalDebit - totalCredit,
      }
    })

    const grandDebit = trialBalance.reduce((s, a) => s + a.totalDebit, 0)
    const grandCredit = trialBalance.reduce((s, a) => s + a.totalCredit, 0)

    return NextResponse.json({
      accounts: trialBalance,
      summary: {
        totalDebit: grandDebit,
        totalCredit: grandCredit,
        difference: grandDebit - grandCredit,
        isBalanced: Math.abs(grandDebit - grandCredit) < 0.01,
        accountCount: trialBalance.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
