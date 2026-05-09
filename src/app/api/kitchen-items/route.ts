import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  const limit = parseInt(searchParams.get('limit') || '200')

  const where: any = { companyId }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { supplier: { contains: search } },
      { storageArea: { contains: search } },
    ]
  }
  if (status) where.status = status
  if (category) where.category = category

  const items = await db.kitchenItem.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await db.kitchenItem.create({ data })
  return NextResponse.json(item, { status: 201 })
}
