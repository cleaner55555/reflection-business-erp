import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function calculateScore(deal: {
  contactId: string | null
  value: number
  closeDate: Date | string | null
  probability: number
  notes: string | null
  partnerId: string | null
  source: string
}): number {
  let score = 0
  if (deal.contactId) score += 15
  if (deal.value > 0) score += 15
  if (deal.closeDate) score += 10
  if (deal.probability > 50) score += 10
  if (deal.notes && deal.notes.trim().length > 0) score += 5
  if (deal.partnerId) score += 15
  if (deal.source && deal.source !== 'manual') score += 10
  if (deal.probability > 80) score += 10
  if (deal.value > 100000) score += 10
  return Math.min(score, 100)
}

export async function POST(): Promise<NextResponse> {
  try {
    const deals = await db.deal.findMany()
    let updated = 0

    for (const deal of deals) {
      const score = calculateScore(deal as Parameters<typeof calculateScore>[0])
      const expectedRevenue = (deal.value || 0) * (deal.probability || 0) / 100
      if (score !== deal.score || expectedRevenue !== deal.expectedRevenue) {
        await db.deal.update({ where: { id: deal.id }, data: { score, expectedRevenue } })
        updated++
      }
    }

    return NextResponse.json({ success: true, total: deals.length, updated })
  } catch {
    return NextResponse.json({ error: 'Greška pri preračunavanju' }, { status: 500 })
  }
}
