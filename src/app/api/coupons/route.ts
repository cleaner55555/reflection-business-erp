import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const type = searchParams.get('type') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = { companyId }
  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } },
    ]
  }
  if (status) where.status = status
  if (type) where.type = type

  const [items, total] = await Promise.all([
    db.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.coupon.count({ where }),
  ])

  return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await db.coupon.create({ data })
  return NextResponse.json(item, { status: 201 })
}
