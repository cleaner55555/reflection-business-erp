import { NextResponse } from 'next/server'

export async function GET() {
  // Notes module uses local/mock data — no Prisma model exists
  return NextResponse.json({
    totalNotes: 0,
    totalCategories: 0,
    pinnedNotes: 0,
    recentActivity: [],
    notesByCategory: [],
    topTags: [],
  })
}
