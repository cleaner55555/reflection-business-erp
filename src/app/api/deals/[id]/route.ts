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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      contact: true,
      partner: true,
      activities: { orderBy: { createdAt: 'desc' } },
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
    // Recalculate score on any update
    const existing = await db.deal.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })

    const merged = {
      contactId: body.contactId ?? existing.contactId,
      value: body.value !== undefined ? Number(body.value) : existing.value,
      closeDate: body.closeDate !== undefined ? (body.closeDate ? new Date(body.closeDate) : null) : existing.closeDate,
      probability: body.probability !== undefined ? Number(body.probability) : existing.probability,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      partnerId: body.partnerId ?? existing.partnerId,
    }

    const score = calculateScore(merged)

    const deal = await db.deal.update({
      where: { id },
      data: { ...body, score },
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
