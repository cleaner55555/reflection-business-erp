import { NextResponse } from 'next/server'

export async function GET() {
  // Approvals module uses local/mock data — no Prisma model exists
  return NextResponse.json({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    avgResponseHours: 0,
    myPendingCount: 0,
    urgentPendingCount: 0,
    requestsByType: [],
    requestsByPriority: [],
    monthlyTrend: [],
    recentRequests: [],
  })
}
