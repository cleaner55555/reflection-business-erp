import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pos/shifts - list shifts
export async function GET(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json([], { status: 200 })

  const status = req.nextUrl.searchParams.get('status')
  const where: Record<string, unknown> = { companyId }
  if (status) where.status = status

  const shifts = await db.pOSShift.findMany({
    where,
    include: {
      orders: { select: { id: true, totalAmount: true, paymentMethod: true, status: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { openedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(shifts)
}

// POST /api/pos/shifts - open new shift
export async function POST(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const body = await req.json()
  const { cashierName, openingBalance = 0, note } = body

  // Find today's last shift number
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const lastShift = await db.pOSShift.findFirst({
    where: {
      companyId,
      openedAt: { gte: today, lt: tomorrow },
    },
    orderBy: { number: 'desc' },
  })

  const number = (lastShift?.number || 0) + 1

  const shift = await db.pOSShift.create({
    data: {
      companyId,
      number,
      cashierName: cashierName || 'Anonimus',
      openingBalance,
      note,
      status: 'otvorena',
    },
  })

  return NextResponse.json(shift, { status: 201 })
}
