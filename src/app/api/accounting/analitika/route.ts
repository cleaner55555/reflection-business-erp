import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/accounting/analitika?year=2025&dimension=partner
// Analitičko knjigovodstvo - analytical accounting by dimensions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const dimension = searchParams.get('dimension') || 'partner' // partner, account, type
    const partnerId = searchParams.get('partnerId') || ''

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const whereClause: Record<string, unknown> = {
      date: { gte: startDate, lte: endDate },
    }
    if (partnerId) whereClause.partnerId = partnerId

    const entries = await db.journalEntry.findMany({
      where: whereClause,
      include: {
        account: { select: { code: true, name: true, type: true } },
        partner: { select: { id: true, name: true, type: true } },
      },
      orderBy: { date: 'desc' },
      take: 500,
    })

    // Group by dimension
    const groups: Record<string, {
      name: string
      type: string
      debit: number
      credit: number
      saldo: number
      count: number
      byAccountType: Record<string, number>
      monthly: Record<number, number>
    }> = {}

    for (const entry of entries) {
      let key = 'Nepoznato'
      let name = 'Nepoznato'
      let type = ''

      if (dimension === 'partner') {
        key = entry.partnerId || 'bez_partnera'
        name = entry.partner?.name || 'Bez partnera'
        type = entry.partner?.type || ''
      } else if (dimension === 'account') {
        key = entry.account?.code || 'unknown'
        name = entry.account?.name || 'Nepoznato'
        type = entry.account?.type || ''
      } else if (dimension === 'type') {
        key = entry.account?.type || 'nepoznato'
        name = entry.account?.type || 'Nepoznato'
        type = ''
      }

      if (!groups[key]) {
        groups[key] = { name, type, debit: 0, credit: 0, saldo: 0, count: 0, byAccountType: {}, monthly: {} }
      }

      groups[key].debit += entry.debit || 0
      groups[key].credit += entry.credit || 0
      groups[key].count++
      groups[key].saldo += (entry.debit || 0) - (entry.credit || 0)

      // By account type
      const accType = entry.account?.type || 'other'
      if (!groups[key].byAccountType[accType]) groups[key].byAccountType[accType] = 0
      groups[key].byAccountType[accType] += (entry.debit || 0) - (entry.credit || 0)

      // Monthly
      const m = new Date(entry.date).getMonth() + 1
      if (!groups[key].monthly[m]) groups[key].monthly[m] = 0
      groups[key].monthly[m] += (entry.debit || 0) - (entry.credit || 0)
    }

    // Totals
    let totalDebit = 0
    let totalCredit = 0
    for (const g of Object.values(groups)) {
      totalDebit += g.debit
      totalCredit += g.credit
    }

    // Top partners (if dimension !== partner)
    const partnerSummary: Array<{ id: string; name: string; type: string; total: number }> = []
    if (dimension !== 'partner') {
      const partnerMap: Record<string, { name: string; type: string; total: number }> = {}
      for (const entry of entries) {
        const pId = entry.partnerId
        if (!pId) continue
        if (!partnerMap[pId]) partnerMap[pId] = { name: entry.partner?.name || 'Nepoznat', type: entry.partner?.type || '', total: 0 }
        partnerMap[pId].total += (entry.debit || 0) + (entry.credit || 0)
      }
      partnerSummary.push(...Object.entries(partnerMap)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10))
    }

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

    return NextResponse.json({
      dimension,
      year,
      period: `${year}`,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      totalSaldo: Math.round((totalDebit - totalCredit) * 100) / 100,
      groupCount: Object.keys(groups).length,
      groups: Object.entries(groups).map(([key, g]) => ({
        key,
        name: g.name,
        type: g.type,
        debit: Math.round(g.debit * 100) / 100,
        credit: Math.round(g.credit * 100) / 100,
        saldo: Math.round(g.saldo * 100) / 100,
        count: g.count,
        byAccountType: Object.fromEntries(Object.entries(g.byAccountType).map(([k, v]) => [k, Math.round(v * 100) / 100])),
        monthly: Object.fromEntries(Object.entries(g.monthly).map(([k, v]) => [k, Math.round(v * 100) / 100])),
      })).sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo)),
      partnerSummary,
      monthLabels,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
