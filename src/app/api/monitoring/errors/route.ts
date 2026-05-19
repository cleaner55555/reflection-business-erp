import { NextRequest, NextResponse } from 'next/server'
import { errorTracker } from '@/lib/monitoring/error-tracker'

// GET /api/monitoring/errors?severity=critical|error|warning&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const endpoint = searchParams.get('endpoint')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    // Validate severity
    if (severity && !['info', 'warning', 'error', 'critical'].includes(severity)) {
      return NextResponse.json(
        { success: false, error: 'Invalid severity — must be info, warning, error, or critical' },
        { status: 400 }
      )
    }

    const errors = errorTracker.getErrors({
      severity: severity as 'info' | 'warning' | 'error' | 'critical' | undefined,
      endpoint: endpoint || undefined,
      limit,
    })

    const stats = errorTracker.getErrorStats()

    return NextResponse.json({
      success: true,
      data: {
        errors,
        stats,
        pagination: {
          total: stats.totalUnique,
          limit,
          returned: errors.length,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch errors' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/errors — manual error reporting (e.g. from error boundary)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, severity, stack } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    const validSeverities = ['info', 'warning', 'error', 'critical']
    const resolvedSeverity = validSeverities.includes(severity) ? severity : 'error'

    // Create an Error object so we get fingerprinting with stack
    const error = new Error(message)
    if (stack) error.stack = stack

    errorTracker.captureError(error, {
      endpoint: context?.endpoint,
      userId: context?.userId,
      companyId: context?.companyId,
      ip: context?.ip,
      userAgent: context?.userAgent,
    }, resolvedSeverity)

    return NextResponse.json({
      success: true,
      message: 'Error reported successfully',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to report error' },
      { status: 500 }
    )
  }
}
