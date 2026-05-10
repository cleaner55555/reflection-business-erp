import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId') || ''
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

    const [
      totalOrders,
      draftOrders,
      sentOrders,
      confirmedOrders,
      totalAmountResult,
      avgAmountResult,
      recentOrders,
      statusBreakdown,
    ] = await Promise.all([
      db.salesOrder.count({ where: { companyId } }),
      db.salesOrder.count({ where: { companyId, status: 'nacrt' } }),
      db.salesOrder.count({ where: { companyId, status: 'poslata' } }),
      db.salesOrder.count({ where: { companyId, status: 'potvrdena' } }),
      db.salesOrder.aggregate({ where: { companyId }, _sum: { totalAmount: true } }),
      db.salesOrder.aggregate({ where: { companyId }, _avg: { totalAmount: true } }),
      db.salesOrder.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { partner: { select: { id: true, name: true } } },
      }),
      db.salesOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
      }),
    ])

    const recentOrdersMapped = recentOrders.map(o => ({
      id: o.id,
      number: o.number,
      partnerId: o.partnerId,
      partnerName: o.partner?.name || '',
      status: o.status,
      totalAmount: o.totalAmount,
      dateOrder: o.date.toISOString().split('T')[0],
      validUntil: null,
      notes: o.notes || '',
      createdAt: o.createdAt.toISOString(),
    }))

    // Monthly trend (last 6 months) — use Prisma queries instead of raw SQL to avoid BigInt
    const now = new Date()
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const count = await db.salesOrder.count({
        where: {
          companyId,
          createdAt: { gte: d, lte: dEnd },
        },
      })
      monthlyTrend.push({ month: monthStr, count })
    }

    // Top partners by offer value
    const topPartnersResult = await db.salesOrder.groupBy({
      by: ['partnerId'],
      where: { companyId },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5,
    })

    const topPartnerIds = topPartnersResult.map(p => p.partnerId).filter(Boolean)
    const partnerNames = topPartnerIds.length > 0
      ? await db.partner.findMany({
          where: { id: { in: topPartnerIds } },
          select: { id: true, name: true },
        })
      : []
    const partnerNameMap = new Map(partnerNames.map(p => [p.id, p.name]))

    const topPartners = topPartnersResult.map(p => ({
      partnerId: p.partnerId,
      partnerName: partnerNameMap.get(p.partnerId) || '-',
      totalValue: p._sum.totalAmount || 0,
    }))

    return NextResponse.json({
      totalOrders,
      draftOrders,
      sentOrders,
      confirmedOrders,
      totalAmount: totalAmountResult._sum.totalAmount || 0,
      avgAmount: avgAmountResult._avg.totalAmount || 0,
      recentOrders: recentOrdersMapped,
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
      monthlyTrend,
      topPartners,
    })
  } catch (error) {
    console.error('Sales orders dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
