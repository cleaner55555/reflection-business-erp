import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId') || ''

    const where: Record<string, unknown> = {}
    if (companyId) where.companyId = companyId

    const items = await db.forumCategory.findMany({ where, orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.forumCategory.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
