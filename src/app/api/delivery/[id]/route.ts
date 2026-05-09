import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const data: Record<string, unknown> = {}

    if (body.senderName !== undefined) data.senderName = body.senderName
    if (body.senderPhone !== undefined) data.senderPhone = body.senderPhone
    if (body.senderAddress !== undefined) data.senderAddress = body.senderAddress
    if (body.recipientName !== undefined) data.recipientName = body.recipientName
    if (body.recipientPhone !== undefined) data.recipientPhone = body.recipientPhone
    if (body.recipientAddress !== undefined) data.recipientAddress = body.recipientAddress
    if (body.priority !== undefined) data.priority = body.priority
    if (body.weight !== undefined) data.weight = body.weight
    if (body.dimensions !== undefined) data.dimensions = body.dimensions
    if (body.codAmount !== undefined) data.codAmount = body.codAmount
    if (body.shippingCost !== undefined) data.shippingCost = body.shippingCost
    if (body.estimatedDelivery !== undefined) data.estimatedDelivery = new Date(body.estimatedDelivery)
    if (body.assignedDriver !== undefined) data.assignedDriver = body.assignedDriver
    if (body.currentLocation !== undefined) data.currentLocation = body.currentLocation
    if (body.notes !== undefined) data.notes = body.notes

    // Status change with history append
    if (body.status !== undefined) {
      data.status = body.status
      if (['delivered', 'failed', 'returned'].includes(body.status)) {
        data.actualDelivery = new Date()
      }
      // Append to history
      const existing = await db.deliveryOrder.findUnique({ where: { id } })
      if (existing) {
        let history = []
        try { history = JSON.parse(existing.history || '[]') } catch { history = [] }
        const STATUSES: Record<string, string> = {
          pending_pickup: 'Čeka preuzimanje', picked_up: 'Preuzeto', in_transit: 'U tranzitu',
          out_for_delivery: 'Isporuka', delivered: 'Isporučeno', failed: 'Neuspešno', returned: 'Vraćeno',
        }
        history.push({
          date: new Date().toLocaleString('sr-RS'),
          status: body.status,
          location: body.currentLocation || existing.currentLocation || '',
          note: `Status changed to ${STATUSES[body.status] || body.status}`,
        })
        data.history = JSON.stringify(history)
      }
    }

    const updated = await db.deliveryOrder.update({ where: { id }, data })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/delivery/[id]:', error)
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.deliveryOrder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/delivery/[id]:', error)
    return NextResponse.json({ error: 'Failed to delete delivery' }, { status: 500 })
  }
}
