import { NextResponse } from 'next/server'

export async function GET() {
  // Contracts module uses local/mock data — no Prisma model exists
  return NextResponse.json({
    activeContracts: 0,
    expiringSoon: 0,
    expiredContracts: 0,
    terminatedContracts: 0,
    totalEmployees: 0,
    avgSalary: 0,
    totalPayroll: 0,
    byType: [],
    recentContracts: [],
  })
}
