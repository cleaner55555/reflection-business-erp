import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  const status = searchParams.get('status')
  const where: any = { companyId }
  if (status) where.status = status

  const disputes = await db.mpDispute.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      vendor: { select: { slug: true } },
      order: { select: { number: true, retailerName: true } },
    },
  })

  return NextResponse.json(disputes.map(d => ({
    ...d,
    vendorName: d.vendor.slug,
    orderNumber: d.order.number,
    orderRetailer: d.order.retailerName,
    vendor: undefined,
    order: undefined,
    review: undefined,
  })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.vendorId || !body.orderId || !body.type) {
    return NextResponse.json({ error: 'vendorId, orderId, and type required' }, { status: 400 })
  }

  try {
    const dispute = await db.mpDispute.create({
      data: {
        companyId: body.companyId,
        vendorId: body.vendorId,
        orderId: body.orderId,
        reviewId: body.reviewId || null,
        type: body.type,
        description: body.description || '',
        priority: body.priority || 'srednji',
      },
    })
    return NextResponse.json(dispute, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
