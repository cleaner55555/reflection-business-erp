import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId') || ''
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1)
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59)
    where.date = { gte: start, lte: end }
  }

  const attendances = await db.attendance.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(attendances)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { employeeId, date, hoursWorked, type, notes } = body
  if (!employeeId || !date) return NextResponse.json({ error: 'Zaposleni i datum obavezni' }, { status: 400 })

  const att = await db.attendance.create({
    data: { employeeId, date: new Date(date), hoursWorked: Number(hoursWorked) || 8, type: type || 'rad', notes },
  })
  return NextResponse.json(att, { status: 201 })
}
