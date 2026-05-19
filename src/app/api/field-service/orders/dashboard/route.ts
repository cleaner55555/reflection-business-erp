import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.workOrder.count({ where })
    const open = await db.workOrder.count({ where: { ...where, status: 'planiran' } })
    const inProgress = await db.workOrder.count({ where: { ...where, status: 'u_toku' } })

    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    const completedToday = await db.workOrder.count({
      where: { ...where, status: 'završen', completedDate: { gte: todayStart, lt: todayEnd } }
    })

    const overdue = await db.workOrder.count({
      where: { ...where, status: { in: ['planiran', 'dodeljen', 'u_toku'] }, scheduledDate: { lt: today } }
    })

    const recent = await db.workOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalOrders: total,
      openOrders: open,
      inProgressOrders: inProgress,
      completedToday,
      overdueOrders: overdue,
      recentOrders: recent.map(o => ({
        id: o.id,
        orderNumber: o.id.slice(-8),
        customerName: o.partnerName || '',
        address: o.address || '',
        type: o.type,
        description: o.description,
        priority: o.priority,
        status: o.status,
        assignedTo: o.assignedTo || '',
        scheduledDate: o.scheduledDate?.toISOString(),
        completedDate: o.completedDate?.toISOString(),
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
      })),
      typeBreakdown: [],
    })
  } catch (error) {
    console.error('Field service dashboard error:', error)
    return NextResponse.json({
      totalOrders: 0, openOrders: 0, inProgressOrders: 0,
      completedToday: 0, overdueOrders: 0, recentOrders: [], typeBreakdown: [],
    })
  }
}
