import { NextRequest, NextResponse } from 'next/server'
import { getMetricsSummary } from '@/lib/monitoring/dashboard'

// GET /api/monitoring/metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'performance' | 'errors' | 'usage' | null
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const fromMs = from ? parseInt(from, 10) : undefined
    const toMs = to ? parseInt(to, 10) : undefined

    // Validate timestamps
    if (fromMs !== undefined && isNaN(fromMs)) {
      return NextResponse.json(
        { success: false, error: 'Invalid "from" parameter — must be a Unix timestamp in ms' },
        { status: 400 }
      )
    }
    if (toMs !== undefined && isNaN(toMs)) {
      return NextResponse.json(
        { success: false, error: 'Invalid "to" parameter — must be a Unix timestamp in ms' },
        { status: 400 }
      )
    }

    const data = getMetricsSummary(type || undefined, fromMs, toMs)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
