import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId') || ''
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = { companyId }
    if (category) where.category = category
    if (search) where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]

    const items = await db.forumTopic.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.forumTopic.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
