import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage') || ''

  const where: Record<string, unknown> = {}
  if (stage) where.stage = stage

  const deals = await db.deal.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { contact: { select: { id: true, firstName: true, lastName: true } }, partner: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, value, stage, probability, contactId, partnerId, assignedTo, closeDate, notes } = body
  if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 })

  const deal = await db.deal.create({
    data: { title, value: Number(value) || 0, stage: stage || 'lead', probability: Number(probability) || 10, contactId, partnerId, assignedTo, closeDate: closeDate ? new Date(closeDate) : null, notes },
  })
  return NextResponse.json(deal, { status: 201 })
}
