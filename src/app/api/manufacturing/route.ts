import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const type = searchParams.get('type') || '' // orders, machines

  if (type === 'machines') {
    const where: any = { companyId }
    if (search) where.OR = [
      { name: { contains: search } },
      { location: { contains: search } },
    ]
    const items = await db.mfgMachine.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ items })
  }

  // Default: production orders
  const where: any = { companyId }
  if (search) where.OR = [
    { orderNumber: { contains: search } },
    { productName: { contains: search } },
  ]
  if (status) where.status = status

  const items = await db.mfgProductionOrder.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await db.mfgProductionOrder.create({ data })
  return NextResponse.json(item, { status: 201 })
}
