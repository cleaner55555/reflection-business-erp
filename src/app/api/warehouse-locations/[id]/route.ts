import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const location = await db.warehouseLocation.update({ where: { id }, data: body })
    return NextResponse.json(location)
  } catch { return NextResponse.json({ error: 'Greška pri ažuriranju' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try { await db.warehouseLocation.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch { return NextResponse.json({ error: 'Greška pri brisanju' }, { status: 500 }) }
}
