import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contact = await db.contact.findUnique({ where: { id }, include: { partner: true, activities: true, deals: true } })
  if (!contact) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
  return NextResponse.json(contact)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const contact = await db.contact.update({ where: { id }, data: body })
    return NextResponse.json(contact)
  } catch { return NextResponse.json({ error: 'Greška pri ažuriranju' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.contact.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Greška pri brisanju' }, { status: 500 }) }
}
