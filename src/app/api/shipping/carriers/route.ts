import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shipping/carriers?companyId=xxx
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const carriers = await db.shippingCarrier.findMany({
      where: { companyId },
      include: {
        _count: { select: { orders: true } }
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(carriers)
  } catch (error) {
    console.error('Shipping carriers GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 })
  }
}

// POST /api/shipping/carriers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyId, name, code, type, website, apiUrl, contactPhone, contactEmail,
            defaultWeight, defaultPrice, deliveryEstimate, notes } = body

    if (!companyId || !name || !code) {
      return NextResponse.json({ error: 'companyId, name and code are required' }, { status: 400 })
    }

    const existing = await db.shippingCarrier.findFirst({
      where: { companyId, code }
    })
    if (existing) {
      return NextResponse.json({ error: 'Carrier with this code already exists' }, { status: 409 })
    }

    const carrier = await db.shippingCarrier.create({
      data: {
        companyId, name, code,
        type: type || 'domestic',
        website: website || null,
        apiUrl: apiUrl || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        defaultWeight: defaultWeight || 0.5,
        defaultPrice: defaultPrice || 0,
        deliveryEstimate: deliveryEstimate || '1-3',
        notes: notes || null,
      }
    })

    return NextResponse.json(carrier, { status: 201 })
  } catch (error) {
    console.error('Shipping carriers POST error:', error)
    return NextResponse.json({ error: 'Failed to create carrier' }, { status: 500 })
  }
}

// PUT /api/shipping/carriers (batch update)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const carrier = await db.shippingCarrier.update({
      where: { id },
      data
    })
    return NextResponse.json(carrier)
  } catch (error) {
    console.error('Shipping carriers PUT error:', error)
    return NextResponse.json({ error: 'Failed to update carrier' }, { status: 500 })
  }
}

// DELETE /api/shipping/carriers?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const orderCount = await db.shippingOrder.count({ where: { carrierId: id } })
    if (orderCount > 0) {
      return NextResponse.json({ error: `Cannot delete carrier with ${orderCount} orders` }, { status: 400 })
    }

    await db.shippingCarrier.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Shipping carriers DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 })
  }
}
