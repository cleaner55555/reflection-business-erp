import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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

const DEAL_STAGES = ['lead', 'kvalifikacija', 'predlog', 'pregovaranje', 'won', 'lost']
const DEAL_SOURCES = ['manual', 'web', 'referral', 'cold_call', 'email', 'social', 'trade_show', 'advertising', 'other']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage') || ''
  const source = searchParams.get('source') || ''
  const assignedTo = searchParams.get('assignedTo') || ''
  const search = searchParams.get('search') || ''

  const where: Record<string, unknown> = {}
  if (stage && DEAL_STAGES.includes(stage)) where.stage = stage
  if (source && DEAL_SOURCES.includes(source)) where.source = source
  if (assignedTo) where.assignedTo = assignedTo
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { notes: { contains: search } },
      { contact: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }, { email: { contains: search } }] } },
      { partner: { name: { contains: search } } },
    ]
  }

  const deals = await db.deal.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      partner: { select: { id: true, name: true } },
      _count: { select: { activities: true } }
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, value, stage, probability, contactId, partnerId, assignedTo, closeDate, notes, source, tags } = body
  if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 })

  const dealData = {
    title,
    value: Number(value) || 0,
    expectedRevenue: Number(value) ? Number(value) * (Number(probability) || 10) / 100 : 0,
    stage: stage && DEAL_STAGES.includes(stage) ? stage : 'lead',
    probability: Number(probability) || 10,
    contactId: contactId || null,
    partnerId: partnerId || null,
    assignedTo: assignedTo || null,
    closeDate: closeDate ? new Date(closeDate) : null,
    notes: notes || null,
    source: source && DEAL_SOURCES.includes(source) ? source : 'manual',
    tags: tags || null,
  }

  dealData.score = calculateScore(dealData)

  const deal = await db.deal.create({ data: dealData })
  return NextResponse.json(deal, { status: 201 })
}
