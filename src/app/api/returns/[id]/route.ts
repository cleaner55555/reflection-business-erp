import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const data: Record<string, unknown> = {}

    if (body.status !== undefined) {
      data.status = body.status
      // Auto-set processedDate for terminal statuses
      if (['refunded', 'exchanged', 'completed', 'rejected'].includes(body.status)) {
        data.processedDate = new Date()
      }
    }
    if (body.customerName !== undefined) data.customerName = body.customerName
    if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail
    if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone
    if (body.returnReason !== undefined) data.returnReason = body.returnReason
    if (body.items !== undefined) data.items = typeof body.items === 'string' ? body.items : JSON.stringify(body.items)
    if (body.refundAmount !== undefined) data.refundAmount = body.refundAmount
    if (body.refundMethod !== undefined) data.refundMethod = body.refundMethod
    if (body.shippingCost !== undefined) data.shippingCost = body.shippingCost
    if (body.restockingFee !== undefined) data.restockingFee = body.restockingFee
    if (body.netRefund !== undefined) data.netRefund = body.netRefund
    if (body.receivedDate !== undefined) data.receivedDate = body.receivedDate ? new Date(body.receivedDate) : null
    if (body.notes !== undefined) data.notes = body.notes
    if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes

    const updated = await db.returnOrder.update({ where: { id }, data })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/returns/[id]:', error)
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.returnOrder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/returns/[id]:', error)
    return NextResponse.json({ error: 'Failed to delete return' }, { status: 500 })
  }
}
