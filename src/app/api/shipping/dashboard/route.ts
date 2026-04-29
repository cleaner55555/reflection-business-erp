import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shipping/dashboard?companyId=xxx
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    const [
      totalOrders,
      draftOrders,
      inTransitOrders,
      deliveredToday,
      returnedOrders,
      weekOrders,
      totalCost,
      activeCarriers,
      recentOrders,
      ordersByCarrier,
      ordersByStatus,
    ] = await Promise.all([
      // Total orders
      db.shippingOrder.count({ where: { companyId } }),
      // Draft orders
      db.shippingOrder.count({ where: { companyId, status: 'nacrt' } }),
      // In transit
      db.shippingOrder.count({ where: { companyId, status: 'u_tranzitu' } }),
      // Delivered today
      db.shippingOrder.count({ where: { companyId, status: 'isporuceno', deliveredAt: { gte: todayStart } } }),
      // Returned
      db.shippingOrder.count({ where: { companyId, status: 'vraceno' } }),
      // This week orders
      db.shippingOrder.count({ where: { companyId, createdAt: { gte: weekStart } } }),
      // Total shipping cost
      db.shippingOrder.aggregate({
        where: { companyId },
        _sum: { shippingCost: true, codAmount: true }
      }),
      // Active carriers
      db.shippingCarrier.count({ where: { companyId, isActive: true } }),
      // Recent 10 orders
      db.shippingOrder.findMany({
        where: { companyId },
        include: {
          carrier: { select: { name: true } },
          partner: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Orders by carrier
      db.shippingOrder.groupBy({
        by: ['carrierId'],
        where: { companyId, carrierId: { not: null } },
        _count: { id: true },
        _sum: { shippingCost: true },
      }),
      // Orders by status
      db.shippingOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
      }),
    ])

    // Enrich carrier stats
    const carrierStats = await Promise.all(
      ordersByCarrier.map(async (g) => {
        const carrier = g.carrierId ? await db.shippingCarrier.findUnique({ where: { id: g.carrierId! } }) : null
        return {
          carrierId: g.carrierId,
          carrierName: carrier?.name || 'N/A',
          carrierCode: carrier?.code || '',
          count: g._count.id,
          totalCost: g._sum.shippingCost || 0,
        }
      })
    )

    return NextResponse.json({
      totalOrders,
      draftOrders,
      inTransitOrders,
      deliveredToday,
      returnedOrders,
      weekOrders,
      totalShippingCost: totalCost._sum.shippingCost || 0,
      totalCodAmount: totalCost._sum.codAmount || 0,
      activeCarriers,
      recentOrders,
      carrierStats,
      statusBreakdown: ordersByStatus.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
    })
  } catch (error) {
    console.error('Shipping dashboard GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
