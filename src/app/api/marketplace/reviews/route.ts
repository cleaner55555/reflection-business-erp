import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  const vendorId = searchParams.get('vendorId')
  const where: any = { companyId, status: 'objavljen' }
  if (vendorId) where.vendorId = vendorId

  const reviews = await db.mpReview.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { slug: true } } },
  })

  return NextResponse.json(reviews.map(r => ({
    ...r,
    vendorName: r.vendor.slug,
    vendor: undefined,
  })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.vendorId || !body.authorName || !body.rating) {
    return NextResponse.json({ error: 'vendorId, authorName, and rating required' }, { status: 400 })
  }

  try {
    const review = await db.mpReview.create({
      data: {
        companyId: body.companyId,
        vendorId: body.vendorId,
        orderId: body.orderId || null,
        productId: body.productId || null,
        productName: body.productName || '',
        authorName: body.authorName,
        rating: Math.min(5, Math.max(1, body.rating)),
        title: body.title || '',
        comment: body.comment || '',
      },
    })

    // Update vendor rating
    const allReviews = await db.mpReview.findMany({ where: { vendorId: body.vendorId } })
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    await db.mpVendor.update({
      where: { id: body.vendorId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
