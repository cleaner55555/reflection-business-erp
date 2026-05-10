import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId') || ''
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const where: Record<string, unknown> = { companyId }
    if (search) where.OR = [
      { orderNumber: { contains: search } },
      { orderId: { contains: search } },
      { customerName: { contains: search } },
    ]
    if (status) where.status = status
    if (type) where.packagingType = type
    const items = await db.packagingOrder.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch packaging orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.packagingOrder.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create packaging order' }, { status: 500 })
  }
}
