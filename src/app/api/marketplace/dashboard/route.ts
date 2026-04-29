import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 })

  try {
    const [vendors, orders, reviews, disputes] = await Promise.all([
      db.mpVendor.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),
      db.mpOrder.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      db.mpReview.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      db.mpDispute.findMany({ where: { companyId, status: 'otvoren' } }),
    ])

    const activeVendors = vendors.filter(v => v.status === 'active')
    const pendingVendors = vendors.filter(v => v.status === 'pending')
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0)
    const totalCommission = orders.reduce((s, o) => s + o.commissionAmount, 0)
    const ordersByStatus = {
      nacrt: orders.filter(o => o.status === 'nacrt').length,
      potvrđena: orders.filter(o => o.status === 'potvrđena').length,
      poslata: orders.filter(o => o.status === 'poslata' || o.status === 'u_isporuci').length,
      isporučena: orders.filter(o => o.status === 'isporučena' || o.status === 'završena').length,
      stornirana: orders.filter(o => o.status === 'stornirana').length,
    }
    const avgRating = vendors.length > 0
      ? vendors.reduce((s, v) => s + v.rating, 0) / vendors.length : 0

    const topVendors = [...vendors]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map(v => ({ id: v.id, name: v.slug, totalSales: v.totalSales, totalOrders: v.totalOrders, rating: v.rating }))

    const recentOrders = orders.slice(0, 10).map(o => ({
      id: o.id, number: o.number, retailerName: o.retailerName,
      status: o.status, totalAmount: o.totalAmount, createdAt: o.createdAt,
    }))

    const revenueByMonth: Record<string, number> = {}
    orders.forEach(o => {
      if (o.createdAt) {
        const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`
        revenueByMonth[key] = (revenueByMonth[key] || 0) + o.totalAmount
      }
    })

    return NextResponse.json({
      vendors: { total: vendors.length, active: activeVendors.length, pending: pendingVendors.length },
      orders: { total: orders.length, ...ordersByStatus },
      revenue: { total: totalRevenue, commission: totalCommission, avgOrder: orders.length > 0 ? totalRevenue / orders.length : 0 },
      reviews: { total: reviews.length, avgRating: Math.round(avgRating * 10) / 10 },
      disputes: { open: disputes.length },
      topVendors,
      recentOrders,
      revenueByMonth,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
