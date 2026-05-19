import { NextResponse } from 'next/server'

export async function GET() {
  // Visitors module uses local/mock data — no Prisma model exists
  return NextResponse.json({
    todayTotal: 0,
    checkedIn: 0,
    expected: 0,
    avgDuration: 0,
    weekTotal: 0,
    monthTotal: 0,
  })
}
