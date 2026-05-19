import { NextRequest, NextResponse } from 'next/server'
import { compileDashboard, type TimeRange } from '@/lib/monitoring/dashboard'

// GET /api/monitoring/dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '1h') as TimeRange

    // Validate range
    const validRanges: TimeRange[] = ['5m', '15m', '30m', '1h', '6h', '24h']
    if (!validRanges.includes(range)) {
      return NextResponse.json(
        { success: false, error: `Invalid range — must be one of: ${validRanges.join(', ')}` },
        { status: 400 }
      )
    }

    const data = compileDashboard(range)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to compile dashboard data' },
      { status: 500 }
    )
  }
}
