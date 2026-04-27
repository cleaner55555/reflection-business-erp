import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: Record<string, unknown> = {}
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1)
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59)
    where.startTime = { gte: start, lte: end }
  }

  const events = await db.calendarEvent.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { startTime: 'asc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, startTime, endTime, allDay, color, type } = body
  if (!title || !startTime) return NextResponse.json({ error: 'Naslov i početak su obavezni' }, { status: 400 })

  const event = await db.calendarEvent.create({
    data: { title, description, startTime: new Date(startTime), endTime: endTime ? new Date(endTime) : null, allDay: !!allDay, color: color || 'primary', type: type || 'sastanak' },
  })
  return NextResponse.json(event, { status: 201 })
}
