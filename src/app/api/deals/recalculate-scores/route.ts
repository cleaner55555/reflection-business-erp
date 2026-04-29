import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function calculateScore(deal: {
  contactId: string | null
  value: number
  closeDate: Date | string | null
  probability: number
  notes: string | null
  partnerId: string | null
}): number {
  let score = 0
  if (deal.contactId) score += 20
  if (deal.value > 0) score += 20
  if (deal.closeDate) score += 15
  if (deal.probability > 50) score += 15
  if (deal.notes && deal.notes.trim().length > 0) score += 10
  if (deal.partnerId) score += 20
  return Math.min(score, 100)
}

export async function POST(): Promise<NextResponse> {
  try {
    const deals = await db.deal.findMany()
    let updated = 0

    for (const deal of deals) {
      const score = calculateScore(deal)
      if (score !== deal.score) {
        await db.deal.update({ where: { id: deal.id }, data: { score } })
        updated++
      }
    }

    return NextResponse.json({ success: true, total: deals.length, updated })
  } catch {
    return NextResponse.json({ error: 'Greška pri preračunavanju' }, { status: 500 })
  }
}
