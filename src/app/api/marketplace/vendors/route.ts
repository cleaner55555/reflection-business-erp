import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const where: any = { companyId }
  if (status) where.status = status
  if (search) where.OR = [
    { slug: { contains: search } },
    { partnerId: { contains: search } },
  ]

  const vendors = await db.mpVendor.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      orders: { select: { id: true } },
      reviews: { select: { rating: true } },
    },
  })

  return NextResponse.json(vendors.map(v => ({
    ...v,
    orderCount: v.orders.length,
    avgRating: v.reviews.length > 0 ? Math.round(v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length * 10) / 10 : 0,
    orders: undefined,
    reviews: undefined,
  })))
}

export async function POST(req: NextRequest) {
  const companyId = req.headers.get('x-company-id') || (await req.json().then(b => b.companyId).catch(() => null))
  const body = await req.json()

  const slug = (body.slug || body.name || 'vendor')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

  try {
    const vendor = await db.mpVendor.create({
      data: {
        companyId: body.companyId || companyId,
        partnerId: body.partnerId,
        slug,
        description: body.description || '',
        categories: JSON.stringify(body.categories || []),
        deliveryTime: body.deliveryTime,
        minOrderAmount: body.minOrderAmount || 0,
        commissionRate: body.commissionRate || 5,
        paymentTerms: body.paymentTerms || 'odmah',
        shippingFree: body.shippingFree || false,
        bankAccount: body.bankAccount || '',
        status: 'pending',
      },
    })
    return NextResponse.json(vendor, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
