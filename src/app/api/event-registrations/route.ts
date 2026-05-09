import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId') || ''
    const eventId = searchParams.get('eventId') || ''
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const where: Record<string, unknown> = { companyId }
    if (eventId) where.eventId = eventId
    if (status) where.status = status
    if (search) where.OR = [
      { attendee: { contains: search } },
      { eventTitle: { contains: search } },
    ]
    const items = await db.eventRegistration.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.eventRegistration.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 })
  }
}
