import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const reason = searchParams.get('reason') || ''
    const companyId = searchParams.get('companyId') || 'default'

    const where: Record<string, unknown> = { companyId }

    if (search) {
      where.OR = [
        { returnNumber: { contains: search } },
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (reason) where.returnReason = reason

    const data = await db.returnOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/returns:', error)
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const companyId = body.companyId || 'default'

    // Auto-generate return number
    const count = await db.returnOrder.count({ where: { companyId } })
    const year = new Date().getFullYear()
    const returnNumber = `RET-${year}-${String(count + 1).padStart(3, '0')}`

    const returnOrder = await db.returnOrder.create({
      data: {
        companyId,
        returnNumber,
        orderNumber: body.orderNumber || '',
        customerName: body.customerName || '',
        customerEmail: body.customerEmail || '',
        customerPhone: body.customerPhone || '',
        status: body.status || 'requested',
        returnReason: body.returnReason || 'other',
        items: typeof body.items === 'string' ? body.items : JSON.stringify(body.items || []),
        refundAmount: body.refundAmount || 0,
        refundMethod: body.refundMethod || 'original',
        shippingCost: body.shippingCost || 0,
        restockingFee: body.restockingFee || 0,
        netRefund: body.netRefund || 0,
        requestedDate: body.requestedDate ? new Date(body.requestedDate) : new Date(),
        receivedDate: body.receivedDate ? new Date(body.receivedDate) : null,
        processedDate: body.processedDate ? new Date(body.processedDate) : null,
        notes: body.notes || '',
        internalNotes: body.internalNotes || '',
      },
    })

    return NextResponse.json(returnOrder, { status: 201 })
  } catch (error) {
    console.error('POST /api/returns:', error)
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 })
  }
}
