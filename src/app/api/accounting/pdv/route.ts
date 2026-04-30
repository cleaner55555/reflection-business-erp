import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/accounting/pdv?year=2025&month=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const month = parseInt(searchParams.get('month') || '0')

    let startDate: Date
    let endDate: Date

    if (month > 0) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    const entries = await db.journalEntry.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { account: { select: { code: true, name: true, type: true } } },
      orderBy: { date: 'asc' },
    })

    let pdvOutput20 = 0
    let pdvOutput10 = 0
    let pdvOutput0 = 0
    let pdvInput20 = 0
    let pdvInput10 = 0
    let pdvInput0 = 0
    let prometOsnovica = 0
    let nabavkaOsnovica = 0

    const accountSums: Record<string, { debit: number; credit: number; name: string }> = {}

    for (const entry of entries) {
      const code = entry.account?.code || ''
      if (!accountSums[code]) {
        accountSums[code] = { debit: 0, credit: 0, name: entry.account?.name || '' }
      }
      accountSums[code].debit += entry.debit || 0
      accountSums[code].credit += entry.credit || 0
    }

    for (const [code, sums] of Object.entries(accountSums)) {
      const saldo = sums.credit - sums.debit
      const debitSaldo = sums.debit - sums.credit

      if (code.startsWith('22')) {
        if (code === '220') prometOsnovica += Math.abs(saldo)
        else if (code === '221') pdvOutput20 += Math.abs(saldo)
        else if (code === '222') pdvOutput10 += Math.abs(saldo)
        else if (code === '223') pdvOutput0 += Math.abs(saldo)
        else pdvOutput20 += Math.abs(saldo)
      }

      if (code.startsWith('21')) {
        if (code === '210') nabavkaOsnovica += Math.abs(debitSaldo)
        else if (code === '211') pdvInput20 += Math.abs(debitSaldo)
        else if (code === '212') pdvInput10 += Math.abs(debitSaldo)
        else pdvInput20 += Math.abs(debitSaldo)
      }
    }

    const totalPdvOutput = pdvOutput20 + pdvOutput10 + pdvOutput0
    const totalPdvInput = pdvInput20 + pdvInput10 + pdvInput0
    const pdvZaUplatu = totalPdvOutput - totalPdvInput

    const partnerEntries = await db.journalEntry.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        partnerId: { not: null },
        account: { OR: [
          { code: { startsWith: '21' } },
          { code: { startsWith: '22' } },
        ]},
      },
      include: {
        account: { select: { code: true, name: true } },
        partner: { select: { id: true, name: true } },
      },
    })

    const partnerGroups: Record<string, { name: string; pdvOutput: number; pdvInput: number; count: number }> = {}
    for (const pe of partnerEntries) {
      const pId = pe.partnerId!
      if (!partnerGroups[pId]) {
        partnerGroups[pId] = { name: pe.partner?.name || 'Nepoznat', pdvOutput: 0, pdvInput: 0, count: 0 }
      }
      const code = pe.account?.code || ''
      if (code.startsWith('22')) partnerGroups[pId].pdvOutput += pe.credit || 0
      if (code.startsWith('21')) partnerGroups[pId].pdvInput += pe.debit || 0
      partnerGroups[pId].count++
    }

    const periodLabel = month > 0
      ? new Date(year, month - 1).toLocaleDateString('sr-Latn', { month: 'long', year: 'numeric' })
      : `${year}`

    const monthlyBreakdown = month === 0 ? await getMonthlyBreakdown(year) : null

    return NextResponse.json({
      period: { year, month, label: periodLabel },
      output: {
        pdv20: Math.round(pdvOutput20 * 100) / 100,
        pdv10: Math.round(pdvOutput10 * 100) / 100,
        pdv0: Math.round(pdvOutput0 * 100) / 100,
        total: Math.round(totalPdvOutput * 100) / 100,
        osnovica: Math.round(prometOsnovica * 100) / 100,
      },
      input: {
        pdv20: Math.round(pdvInput20 * 100) / 100,
        pdv10: Math.round(pdvInput10 * 100) / 100,
        pdv0: Math.round(pdvInput0 * 100) / 100,
        total: Math.round(totalPdvInput * 100) / 100,
        osnovica: Math.round(nabavkaOsnovica * 100) / 100,
      },
      settlement: {
        zaUplatu: Math.round(Math.max(0, pdvZaUplatu) * 100) / 100,
        naPovrat: Math.round(Math.max(0, -pdvZaUplatu) * 100) / 100,
        saldo: Math.round(pdvZaUplatu * 100) / 100,
      },
      partners: Object.values(partnerGroups).sort((a, b) => (b.pdvOutput + b.pdvInput) - (a.pdvOutput + a.pdvInput)).slice(0, 20),
      monthlyBreakdown,
      accountSums: Object.entries(accountSums)
        .filter(([code]) => code.startsWith('21') || code.startsWith('22'))
        .map(([code, sums]) => ({ code, name: sums.name, debit: Math.round(sums.debit * 100) / 100, credit: Math.round(sums.credit * 100) / 100 })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function getMonthlyBreakdown(year: number) {
  const months = []
  for (let m = 1; m <= 12; m++) {
    const startDate = new Date(year, m - 1, 1)
    const endDate = new Date(year, m, 0, 23, 59, 59)

    const entries = await db.journalEntry.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        account: { OR: [
          { code: { startsWith: '21' } },
          { code: { startsWith: '22' } },
        ]},
      },
      include: { account: { select: { code: true } } },
    })

    let output = 0
    let input = 0
    for (const e of entries) {
      const code = e.account?.code || ''
      if (code.startsWith('22')) output += e.credit || 0
      if (code.startsWith('21')) input += e.debit || 0
    }

    months.push({
      month: m,
      label: new Date(year, m - 1).toLocaleDateString('sr-Latn', { month: 'short' }),
      output: Math.round(output * 100) / 100,
      input: Math.round(input * 100) / 100,
      saldo: Math.round((output - input) * 100) / 100,
    })
  }
  return months
}
