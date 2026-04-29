import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pos/dashboard - POS stats
export async function GET(req: NextRequest) {
  const companyId = req.headers.get('x-company-id')
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Active shift
  const activeShift = await db.pOSShift.findFirst({
    where: { companyId, status: 'otvorena' },
    include: {
      _count: { select: { orders: true } },
      orders: { where: { status: 'placen' }, select: { totalAmount: true, paymentMethod: true } },
    },
    orderBy: { openedAt: 'desc' },
  })

  // Today's stats
  const todayOrders = await db.pOSOrder.findMany({
    where: {
      companyId,
      status: 'placen',
      createdAt: { gte: today, lt: tomorrow },
    },
    select: { totalAmount: true, paymentMethod: true, itemsCount: true },
  })

  const todayTotal = todayOrders.reduce((s, o) => s + o.totalAmount, 0)
  const todayCount = todayOrders.length
  const todayCash = todayOrders.filter((o) => o.paymentMethod === 'gotovina').reduce((s, o) => s + o.totalAmount, 0)
  const todayCard = todayOrders.filter((o) => o.paymentMethod === 'kartica').reduce((s, o) => s + o.totalAmount, 0)
  const todayTransfer = todayOrders.filter((o) => o.paymentMethod === 'transakcioni_racun').reduce((s, o) => s + o.totalAmount, 0)

  // Average ticket
  const avgTicket = todayCount > 0 ? todayTotal / todayCount : 0

  // Top products today
  const topProductsRaw = await db.pOSOrderLine.findMany({
    where: {
      order: { companyId, status: 'placen', createdAt: { gte: today, lt: tomorrow } },
    },
    select: { productId: true, productName: true, quantity: true, total: true },
  })

  const productMap = new Map<string, { name: string; qty: number; total: number }>()
  for (const p of topProductsRaw) {
    const existing = productMap.get(p.productId)
    if (existing) {
      existing.qty += p.quantity
      existing.total += p.total
    } else {
      productMap.set(p.productId, { name: p.productName, qty: p.quantity, total: p.total })
    }
  }

  const topProducts = Array.from(productMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Recent orders (last 20)
  const recentOrders = await db.pOSOrder.findMany({
    where: { companyId },
    include: { shift: { select: { number: true, cashierName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({
    activeShift,
    today: {
      total: todayTotal,
      count: todayCount,
      avgTicket,
      byPayment: { gotovina: todayCash, kartica: todayCard, transakcioni_racun: todayTransfer },
    },
    topProducts,
    recentOrders,
  })
}
