import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.leaveRequest.count({ where })
    const pending = await db.leaveRequest.count({ where: { ...where, status: 'na_čekanju' } })
    const approved = await db.leaveRequest.count({ where: { ...where, status: 'odobreno' } })
    const rejected = await db.leaveRequest.count({ where: { ...where, status: 'odbijeno' } })

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonth = await db.leaveRequest.count({
      where: { ...where, status: 'odobreno', startDate: { gte: monthStart } }
    })

    const recent = await db.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      currentMonthAbsences: currentMonth,
      recentRequests: recent.map(r => ({
        id: r.id,
        employeeName: r.employeeName,
        type: r.type,
        startDate: r.startDate.toISOString().split('T')[0],
        endDate: r.endDate.toISOString().split('T')[0],
        daysCount: r.days,
        status: r.status,
        approvedBy: r.approvedBy || '',
        createdAt: r.createdAt.toISOString(),
      })),
      typeBreakdown: [],
    })
  } catch (error) {
    console.error('Leave requests dashboard error:', error)
    return NextResponse.json({
      totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0,
      currentMonthAbsences: 0, recentRequests: [], typeBreakdown: [],
    })
  }
}
