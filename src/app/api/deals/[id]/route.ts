import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await db.deal.findUnique({ where: { id }, include: { contact: true, partner: true, activities: { orderBy: { createdAt: 'desc' } } } })
  if (!deal) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const deal = await db.deal.update({ where: { id }, data: body })
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
