import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get('topicId') || ''

    const where: Record<string, unknown> = {}
    if (topicId) where.topicId = topicId

    const items = await db.forumReply.findMany({ where, orderBy: { createdAt: 'asc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.forumReply.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}
