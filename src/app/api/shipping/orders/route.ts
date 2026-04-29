import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shipping/orders?companyId=xxx&status=xxx&search=xxx
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const status = req.nextUrl.searchParams.get('status')
    const search = req.nextUrl.searchParams.get('search')

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const where: Record<string, unknown> = { companyId }
    if (status && status !== 'all') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { number: { contains: search } },
        { recipientName: { contains: search } },
        { trackingNumber: { contains: search } },
      ]
    }

    const orders = await db.shippingOrder.findMany({
      where,
      include: {
        carrier: { select: { id: true, name: true, code: true } },
        partner: { select: { id: true, name: true } },
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Shipping orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/shipping/orders
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyId, carrierId, partnerId, deliveryNoteId, invoiceId,
            weight, volume, packageCount, declaredValue, shippingCost,
            codAmount, insurance,
            senderName, senderAddress, senderCity, senderZip, senderPhone,
            recipientName, recipientAddress, recipientCity, recipientZip, recipientPhone, recipientEmail,
            notes } = body

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    // Auto-generate order number: SHP-YYMMDD-NNN
    const now = new Date()
    const dateStr = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const todayPrefix = `SHP-${dateStr}-`

    const lastOrder = await db.shippingOrder.findFirst({
      where: { number: { startsWith: todayPrefix } },
      orderBy: { number: 'desc' },
    })

    let seq = 1
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.number.split('-').pop() || '0', 10)
      seq = lastSeq + 1
    }

    const number = `${todayPrefix}${String(seq).padStart(3, '0')}`

    const order = await db.shippingOrder.create({
      data: {
        companyId,
        number,
        carrierId: carrierId || null,
        partnerId: partnerId || null,
        deliveryNoteId: deliveryNoteId || null,
        invoiceId: invoiceId || null,
        status: 'nacrt',
        weight: weight || 0,
        volume: volume || 0,
        packageCount: packageCount || 1,
        declaredValue: declaredValue || 0,
        shippingCost: shippingCost || 0,
        codAmount: codAmount || 0,
        insurance: insurance || false,
        senderName: senderName || null,
        senderAddress: senderAddress || null,
        senderCity: senderCity || null,
        senderZip: senderZip || null,
        senderPhone: senderPhone || null,
        recipientName: recipientName || null,
        recipientAddress: recipientAddress || null,
        recipientCity: recipientCity || null,
        recipientZip: recipientZip || null,
        recipientPhone: recipientPhone || null,
        recipientEmail: recipientEmail || null,
        notes: notes || null,
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Shipping orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

// PUT /api/shipping/orders (update order or add tracking event)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, addEvent, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // If adding a tracking event
    if (addEvent) {
      const event = await db.shippingEvent.create({
        data: {
          companyId: data.companyId,
          orderId: id,
          status: addEvent.status,
          location: addEvent.location || null,
          description: addEvent.description || null,
        }
      })

      // Auto-update order status based on event
      const statusMap: Record<string, string> = {
        picked_up: 'u_tranzitu',
        in_transit: 'u_tranzitu',
        at_hub: 'u_tranzitu',
        out_for_delivery: 'u_tranzitu',
        delivered: 'isporuceno',
        failed: 'otkazano',
        returned: 'vraceno',
      }

      const updateData: Record<string, unknown> = {}
      if (statusMap[addEvent.status]) {
        updateData.status = statusMap[addEvent.status]
      }
      if (addEvent.status === 'picked_up') {
        updateData.pickedUpAt = new Date()
      }
      if (addEvent.status === 'delivered') {
        updateData.deliveredAt = new Date()
      }
      if (addEvent.status === 'returned') {
        updateData.returnedAt = new Date()
      }

      if (Object.keys(updateData).length > 0) {
        await db.shippingOrder.update({ where: { id }, data: updateData })
      }

      return NextResponse.json(event)
    }

    // Regular update
    const order = await db.shippingOrder.update({
      where: { id },
      data
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Shipping orders PUT error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE /api/shipping/orders?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const order = await db.shippingOrder.findUnique({ where: { id } })
    if (order && order.status !== 'nacrt') {
      return NextResponse.json({ error: 'Only draft orders can be deleted' }, { status: 400 })
    }

    await db.shippingEvent.deleteMany({ where: { orderId: id } })
    await db.shippingOrder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Shipping orders DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
