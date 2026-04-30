import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const STATUS_FLOW: Record<string, string[]> = {
  nacrt: ['potvrđena', 'stornirana'],
  potvrđena: ['u_pripremi', 'stornirana'],
  u_pripremi: ['poslata', 'stornirana'],
  poslata: ['u_isporuci'],
  u_isporuci: ['isporučena'],
  isporučena: ['završena'],
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  try {
    const existing = await db.mpOrder.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const data: any = {}
    if (body.status && body.status !== existing.status) {
      // Validate status transition
      const allowed = STATUS_FLOW[existing.status]
      if (allowed && !allowed.includes(body.status)) {
        return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${body.status}` }, { status: 400 })
      }
      data.status = body.status
      if (body.status === 'isporučena' || body.status === 'završena') data.deliveredAt = new Date()
      if (body.status === 'stornirana') { data.cancelledAt = new Date(); data.cancelReason = body.cancelReason || '' }
    }
    if (body.notes !== undefined) data.notes = body.notes
    if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes
    if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber
    if (body.carrierName !== undefined) data.carrierName = body.carrierName
    if (body.estimatedDelivery !== undefined) data.estimatedDelivery = body.estimatedDelivery ? new Date(body.estimatedDelivery) : null

    const order = await db.mpOrder.update({ where: { id }, data })
    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const order = await db.mpOrder.findUnique({ where: { id } })
    if (order && order.status === 'nacrt') {
      await db.mpOrder.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Can only delete draft orders' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
