import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const companyId = searchParams.get('companyId') || 'default'

    const where: Record<string, unknown> = { companyId }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { recipientName: { contains: search } },
        { senderName: { contains: search } },
        { recipientAddress: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (priority) where.priority = priority

    const data = await db.deliveryOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/delivery:', error)
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'

    const count = await db.deliveryOrder.count({ where: { companyId } })
    const year = new Date().getFullYear()
    const trackingNumber = `DLY-${year}-${String(count + 1).padStart(5, '0')}`

    const priority = body.priority || 'standard'
    const shippingCost = priority === 'express' ? 850 : priority === 'standard' ? 420 : 280
    const days = priority === 'express' ? 1 : priority === 'standard' ? 3 : 5
    const estimatedDelivery = new Date(Date.now() + days * 86400000)

    const initialHistory = JSON.stringify([{
      date: new Date().toLocaleString('sr-RS'),
      status: 'pending_pickup',
      location: body.senderAddress || '',
      note: 'Order created',
    }])

    const delivery = await db.deliveryOrder.create({
      data: {
        companyId,
        trackingNumber,
        senderName: body.senderName || '',
        senderPhone: body.senderPhone || '',
        senderAddress: body.senderAddress || '',
        recipientName: body.recipientName || '',
        recipientPhone: body.recipientPhone || '',
        recipientAddress: body.recipientAddress || '',
        status: 'pending_pickup',
        priority,
        weight: body.weight || 0,
        dimensions: body.dimensions || '',
        codAmount: body.codAmount || 0,
        shippingCost,
        estimatedDelivery,
        assignedDriver: body.assignedDriver || '',
        currentLocation: body.senderAddress || '',
        notes: body.notes || '',
        history: initialHistory,
      },
    })

    return NextResponse.json(delivery, { status: 201 })
  } catch (error) {
    console.error('POST /api/delivery:', error)
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 })
  }
}
