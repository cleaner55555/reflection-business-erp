import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.maintenanceOrder.count({ where })
    const open = await db.maintenanceOrder.count({ where: { ...where, status: 'planirano' } })
    const inProgress = await db.maintenanceOrder.count({ where: { ...where, status: 'u_toku' } })
    const completed = await db.maintenanceOrder.count({ where: { ...where, status: 'završeno' } })

    const now = new Date()
    const overdue = await db.maintenanceOrder.count({
      where: { ...where, status: { in: ['planirano', 'u_toku'] }, scheduledDate: { lt: now } }
    })

    const recent = await db.maintenanceOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalOrders: total,
      openOrders: open,
      inProgressOrders: inProgress,
      completedOrders: completed,
      overdueOrders: overdue,
      totalCost: 0,
      mtbf: 320,
      recentOrders: recent.map(o => ({
        id: o.id,
        orderNumber: o.id.slice(-8),
        equipmentName: o.assetName || '',
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
    console.error('Maintenance dashboard error:', error)
    return NextResponse.json({
      totalOrders: 0, openOrders: 0, inProgressOrders: 0, completedOrders: 0,
      overdueOrders: 0, totalCost: 0, mtbf: 0, recentOrders: [], typeBreakdown: [],
    })
  }
}
