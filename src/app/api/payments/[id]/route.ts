import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}
    const fields = ['invoiceNo', 'client', 'amount', 'currency', 'date', 'dueDate', 'paidDate', 'method', 'status', 'reference', 'category', 'notes']
    for (const f of fields) { if (body[f] !== undefined) data[f] = body[f] }
    const updated = await db.payment.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.payment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
