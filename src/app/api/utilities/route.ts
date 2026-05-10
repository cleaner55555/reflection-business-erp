import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') || ''
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const status = searchParams.get('status') || ''

  if (!companyId) return NextResponse.json([])

  const where: Record<string, unknown> = { companyId }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { provider: { contains: search } },
      { location: { contains: search } },
    ]
  }
  if (type) where.type = type
  if (status) where.status = status

  const items = await db.utility.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { companyId, ...data } = body

  if (!companyId || !data.name) {
    return NextResponse.json({ error: 'companyId i name su obavezni' }, { status: 400 })
  }

  const item = await db.utility.create({
    data: {
      companyId,
      name: data.name,
      provider: data.provider || '',
      accountNo: data.accountNo || '',
      type: data.type || 'electricity',
      status: data.status || 'active',
      monthlyAmount: data.monthlyAmount || 0,
      lastReading: data.lastReading || 0,
      lastReadingDate: data.lastReadingDate || '',
      lastBillDate: data.lastBillDate || '',
      lastBillAmount: data.lastBillAmount || 0,
      dueDate: data.dueDate || '',
      paidDate: data.paidDate || '',
      location: data.location || '',
      notes: data.notes || '',
    },
  })

  return NextResponse.json(item, { status: 201 })
}
