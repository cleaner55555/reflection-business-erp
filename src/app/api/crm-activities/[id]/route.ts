import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const activity = await db.crmActivity.update({ where: { id }, data: body })
    return NextResponse.json(activity)
  } catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try { await db.crmActivity.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch { return NextResponse.json({ error: 'Greška' }, { status: 500 }) }
}
