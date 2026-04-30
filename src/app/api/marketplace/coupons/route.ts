import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  try {
    const where: any = { companyId, isActive: true }
    const search = searchParams.get('search')
    const showExpired = searchParams.get('showExpired')

    if (search) where.code = { contains: search }
    if (!showExpired) {
      where.OR = [
        { validTo: null },
        { validTo: { gte: new Date() } },
      ]
    }

    const coupons = await db.mpCoupon.findMany({
      where,
      include: {
        vendor: { select: { id: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(coupons)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  try {
    const body = await req.json()
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, validFrom, validTo, vendorId, category } = body

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 })
    }

    const coupon = await db.mpCoupon.create({
      data: {
        companyId,
        code: code.toUpperCase(),
        description,
        discountType: discountType || 'procenat',
        discountValue: discountValue || 0,
        minOrderAmount: minOrderAmount || 0,
        maxUses: maxUses || 0,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        vendorId: vendorId || null,
        category: category || null,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
