import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/pos/shifts/[id] - close shift
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = req.headers.get('x-company-id')
  const { id } = await params
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const body = await req.json()
  const { closingBalance, note } = body

  const shift = await db.pOSShift.findUnique({
    where: { id },
    include: { orders: true },
  })

  if (!shift || shift.companyId !== companyId) {
    return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
  }

  if (shift.status === 'zatvorena') {
    return NextResponse.json({ error: 'Shift already closed' }, { status: 400 })
  }

  const cashSales = shift.orders
    .filter((o) => o.paymentMethod === 'gotovina' && o.status === 'placen')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const expectedCash = shift.openingBalance + cashSales
  const difference = closingBalance - expectedCash

  const updated = await db.pOSShift.update({
    where: { id },
    data: {
      status: 'zatvorena',
      closingBalance,
      expectedCash,
      difference,
      closedAt: new Date(),
      ...(note ? { note } : {}),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/pos/shifts/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = req.headers.get('x-company-id')
  const { id } = await params
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const shift = await db.pOSShift.findUnique({ where: { id } })
  if (!shift || shift.companyId !== companyId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const orderCount = await db.pOSOrder.count({ where: { shiftId: id } })
  if (orderCount > 0) {
    return NextResponse.json({ error: 'Cannot delete shift with orders' }, { status: 400 })
  }

  await db.pOSShift.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
