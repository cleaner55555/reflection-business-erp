import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pos/orders - list POS orders
export async function GET(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json([], { status: 200 })

  const shiftId = req.nextUrl.searchParams.get('shiftId')
  const status = req.nextUrl.searchParams.get('status')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')

  const where: Record<string, unknown> = { companyId }
  if (shiftId) where.shiftId = shiftId
  if (status) where.status = status

  const orders = await db.pOSOrder.findMany({
    where,
    include: {
      lines: true,
      shift: { select: { id: true, number: true, cashierName: true } },
      partner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json(orders)
}

// POST /api/pos/orders - create POS order
export async function POST(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const body = await req.json()
  const { shiftId, partnerId, partnerName, paymentMethod, lines, discountAmount = 0, note } = body

  if (!shiftId || !lines || lines.length === 0) {
    return NextResponse.json({ error: 'Shift and lines required' }, { status: 400 })
  }

  // Generate order number
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

  const lastOrder = await db.pOSOrder.findFirst({
    where: {
      companyId,
      orderNumber: { startsWith: `POS-${dateStr}` },
    },
    orderBy: { orderNumber: 'desc' },
  })

  const seq = lastOrder
    ? parseInt(lastOrder.orderNumber.split('-').pop() || '0') + 1
    : 1
  const orderNumber = `POS-${dateStr}-${String(seq).padStart(3, '0')}`

  // Calculate totals
  let subtotal = 0
  let taxAmount = 0
  let totalAmount = 0

  for (const line of lines) {
    const lineSubtotal = line.quantity * line.unitPrice * (1 - (line.discountPct || 0) / 100)
    const lineTax = lineSubtotal * (line.taxRate || 20) / 100
    subtotal += lineSubtotal - lineTax
    taxAmount += lineTax
    totalAmount += lineSubtotal
  }

  totalAmount -= discountAmount
  if (totalAmount < 0) totalAmount = 0

  // Create order with lines
  const order = await db.pOSOrder.create({
    data: {
      companyId,
      shiftId,
      orderNumber,
      partnerId: partnerId || null,
      partnerName: partnerName || null,
      paymentMethod: paymentMethod || 'gotovina',
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: totalAmount,
      changeAmount: 0,
      itemsCount: lines.length,
      status: 'placen',
      note,
      lines: {
        create: lines.map((l: Record<string, unknown>) => ({
          productId: l.productId,
          productName: l.productName,
          sku: l.sku || null,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountPct: l.discountPct || 0,
          taxRate: l.taxRate || 20,
          total: l.quantity * l.unitPrice * (1 - ((l.discountPct || 0) / 100)),
        })),
      },
    },
    include: { lines: true },
  })

  // Deduct stock for each product
  for (const line of lines) {
    await db.product.update({
      where: { id: line.productId as string },
      data: { currentStock: { decrement: line.quantity as number } },
    })

    // Create stock movement
    await db.stockMovement.create({
      data: {
        companyId,
        productId: line.productId as string,
        date: new Date(),
        type: 'izdavanje',
        quantity: line.quantity as number,
        unitCost: line.purchasePrice || 0,
        documentRef: orderNumber,
        notes: `POS narudzbina #${orderNumber}`,
      },
    })
  }

  return NextResponse.json(order, { status: 201 })
}
