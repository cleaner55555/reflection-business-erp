import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage') || ''

  const where: Record<string, unknown> = {}
  if (stage) where.stage = stage

  const deals = await db.deal.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      partner: { select: { id: true, name: true } },
      _count: { select: { activities: true } }
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, value, stage, probability, contactId, partnerId, assignedTo, closeDate, notes } = body
  if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 })

  const dealData = {
    title,
    value: Number(value) || 0,
    stage: stage || 'lead',
    probability: Number(probability) || 10,
    contactId: contactId || null,
    partnerId: partnerId || null,
    assignedTo: assignedTo || null,
    closeDate: closeDate ? new Date(closeDate) : null,
    notes: notes || null,
  }

  dealData.score = calculateScore(dealData)

  const deal = await db.deal.create({ data: dealData })
  return NextResponse.json(deal, { status: 201 })
}
