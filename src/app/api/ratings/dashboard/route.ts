import { NextResponse } from 'next/server'

export async function GET() {
  // Ratings module uses local/mock data — no Prisma model exists
  return NextResponse.json({
    totalRatings: 0,
    avgRating: 0,
    responseRate: 0,
    trendDirection: 'stable' as const,
    trendValue: 0,
    distribution: [],
    topCategories: [],
    recentRatings: [],
  })
}
