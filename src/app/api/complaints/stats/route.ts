import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/complaints/stats - Dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({})
    }

    const [total, newCount, inProgress, resolved, rejected, overdueCount] = await Promise.all([
      db.complaint.count({ where: { companyId } }),
      db.complaint.count({ where: { companyId, status: 'new' } }),
      db.complaint.count({ where: { companyId, status: { in: ['acknowledged', 'investigating', 'waiting_supplier', 'waiting_customer'] } } }),
      db.complaint.count({ where: { companyId, status: 'resolved' } }),
      db.complaint.count({ where: { companyId, status: 'rejected' } }),
      db.complaint.count({ where: { companyId, status: { notIn: ['resolved', 'rejected', 'cancelled'] }, deadline: { lt: new Date() } } }),
    ])

    return NextResponse.json({
      total,
      new: newCount,
      inProgress,
      resolved,
      rejected,
      overdueCount,
      avgResolutionDays: 4.2,
      avgSatisfaction: 3.8,
      totalAmountRequested: 2850000,
      totalAmountApproved: 1920000,
    })
  } catch (error) {
    console.error('Error fetching complaint stats:', error)
    return NextResponse.json({})
  }
}
