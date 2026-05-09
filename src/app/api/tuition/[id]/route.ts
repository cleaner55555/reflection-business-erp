import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const f of ['studentName','program','studyLevel','academicYear','semester','amount','paid','currency','status','dueDate','paidDate','paymentMethod','discount','notes']) {
      if (body[f] !== undefined) data[f] = body[f]
    }
    const updated = await db.tuition.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; await db.tuition.delete({ where: { id } }); return NextResponse.json({ success: true }) }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
