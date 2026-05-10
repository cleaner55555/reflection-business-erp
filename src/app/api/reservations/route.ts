import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const date = searchParams.get('date') || ''
  const area = searchParams.get('area') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = { companyId }
  if (search) {
    where.OR = [
      { guestName: { contains: search } },
      { phone: { contains: search } },
      { reservationNo: { contains: search } },
    ]
  }
  if (status) where.status = status
  if (date) where.date = date
  if (area) where.area = area

  const [items, total] = await Promise.all([
    db.reservation.findMany({
      where,
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.reservation.count({ where }),
  ])

  return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { companyId } = data

  // Auto-generate reservation number
  const count = await db.reservation.count({ where: { companyId } })
  const year = new Date().getFullYear()
  const reservationNo = `REZ-${year}-${String(count + 1).padStart(3, '0')}`

  const item = await db.reservation.create({
    data: { ...data, reservationNo },
  })
  return NextResponse.json(item, { status: 201 })
}
