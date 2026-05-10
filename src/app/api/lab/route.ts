import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId') || ''
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const where: Record<string, unknown> = { companyId }
    if (search) where.OR = [
      { inventoryNo: { contains: search } },
      { name: { contains: search } },
      { manufacturer: { contains: search } },
      { model: { contains: search } },
      { location: { contains: search } },
      { responsible: { contains: search } },
    ]
    if (status) where.status = status
    if (category) where.category = category
    const items = await db.labEquipment.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch lab equipment' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.labEquipment.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create lab equipment' }, { status: 500 })
  }
}
