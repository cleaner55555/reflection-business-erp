import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = { companyId }
  if (search) where.name = { contains: search }
  if (status) where.status = status

  const [items, total] = await Promise.all([
    db.SalesOrder.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.SalesOrder.count({ where })
  ])

  return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await db.SalesOrder.create({ data })
  return NextResponse.json(item, { status: 201 })
}
