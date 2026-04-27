import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await db.document.findUnique({ where: { id }, include: { partner: true } })
  if (!doc) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
  return NextResponse.json(doc)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try { const d = await db.document.update({ where: { id }, data: body }); return NextResponse.json(d) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try { await db.document.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}
