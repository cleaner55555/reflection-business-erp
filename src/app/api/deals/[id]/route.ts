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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      contact: true,
      partner: true,
      activities: { orderBy: { createdAt: 'desc' }, take: 50 },
      _count: { select: { activities: true } }
    }
  })
  if (!deal) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const existing = await db.deal.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.value !== undefined) updateData.value = Number(body.value)
    if (body.stage !== undefined && DEAL_STAGES.includes(body.stage)) updateData.stage = body.stage
    if (body.probability !== undefined) updateData.probability = Number(body.probability)
    if (body.contactId !== undefined) updateData.contactId = body.contactId || null
    if (body.partnerId !== undefined) updateData.partnerId = body.partnerId || null
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo || null
    if (body.closeDate !== undefined) updateData.closeDate = body.closeDate ? new Date(body.closeDate) : null
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.lostReason !== undefined) updateData.lostReason = body.lostReason
    if (body.source !== undefined && DEAL_SOURCES.includes(body.source)) updateData.source = body.source
    if (body.tags !== undefined) updateData.tags = body.tags

    // Recalculate expected revenue and score
    const merged = {
      contactId: updateData.contactId ?? existing.contactId,
      value: updateData.value ?? existing.value,
      closeDate: updateData.closeDate ?? existing.closeDate,
      probability: updateData.probability ?? existing.probability,
      notes: updateData.notes ?? existing.notes,
      partnerId: updateData.partnerId ?? existing.partnerId,
      source: updateData.source ?? existing.source ?? 'manual',
    }
    updateData.expectedRevenue = (Number(merged.value) || 0) * (Number(merged.probability) || 0) / 100
    updateData.score = calculateScore(merged as Parameters<typeof calculateScore>[0])

    const deal = await db.deal.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(deal)
  } catch { return NextResponse.json({ error: 'Greška pri ažuriranju' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.deal.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Greška pri brisanju' }, { status: 500 }) }
}
