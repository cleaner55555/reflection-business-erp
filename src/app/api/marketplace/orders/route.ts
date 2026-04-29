import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  const status = searchParams.get('status')
  const vendorId = searchParams.get('vendorId')
  const search = searchParams.get('search')
  const where: any = { companyId }
  if (status) where.status = status
  if (vendorId) where.vendorId = vendorId
  if (search) where.OR = [
    { number: { contains: search } },
    { retailerName: { contains: search } },
  ]

  const orders = await db.mpOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { slug: true, partnerId: true } } },
  })

  return NextResponse.json(orders.map(o => ({
    ...o,
    vendorName: o.vendor.slug,
    items: JSON.parse(o.items || '[]'),
  })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const now = new Date()
  const prefix = 'MP'
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

  // Count existing orders for auto-numbering
  const count = await db.mpOrder.count({
    where: {
      companyId: body.companyId,
      createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
  })
  const number = `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`

  const items = body.items || []
  const totalAmount = items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0)
  const commissionRate = body.commissionRate || 5
  const commissionAmount = Math.round(totalAmount * commissionRate / 100)

  try {
    const order = await db.mpOrder.create({
      data: {
        companyId: body.companyId,
        vendorId: body.vendorId,
        number,
        retailerName: body.retailerName || '',
        retailerEmail: body.retailerEmail || '',
        retailerPhone: body.retailerPhone || '',
        retailerAddress: body.retailerAddress || '',
        retailerCity: body.retailerCity || '',
        status: body.status || 'nacrt',
        items: JSON.stringify(items),
        totalAmount,
        commissionAmount,
        commissionRate,
        notes: body.notes || '',
        internalNotes: body.internalNotes || '',
      },
    })

    // Update vendor totals
    await db.mpVendor.update({
      where: { id: body.vendorId },
      data: {
        totalOrders: { increment: 1 },
        totalSales: { increment: totalAmount },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
