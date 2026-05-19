import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId, requireTenant, withErrorHandler } from '@/lib/tenant'

// GET /api/usage - Returns usage statistics for current company
// Query params:
//   period: today | week | month (default: today)
//   granularity: hourly | daily (default: hourly)
export async function GET(request: NextRequest) {
  return withErrorHandler(async (req) => {
    const companyId = getTenantId(req)
    if (!companyId) {
      // If no tenant header, try to get first active company for convenience
      return NextResponse.json(
        { error: 'Nedostaje x-company-id header' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'
    const granularity = searchParams.get('granularity') || 'hourly'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'today':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
    }

    // Fetch all usage logs for the period
    const logs = await db.apiUsageLog.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Total calls
    const totalCalls = logs.length

    // Average response time
    const avgResponseTime = totalCalls > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.responseTime, 0) / totalCalls)
      : 0

    // Error count (4xx and 5xx)
    const errors = logs.filter(l => l.statusCode >= 400).length

    // Breakdown by endpoint
    const endpointMap = new Map<string, { calls: number; avgTime: number; errors: number }>()
    for (const log of logs) {
      const existing = endpointMap.get(log.endpoint) || { calls: 0, avgTime: 0, errors: 0 }
      existing.calls++
      existing.avgTime = Math.round(
        (existing.avgTime * (existing.calls - 1) + log.responseTime) / existing.calls
      )
      if (log.statusCode >= 400) existing.errors++
      endpointMap.set(log.endpoint, existing)
    }

    const byEndpoint = Array.from(endpointMap.entries()).map(([endpoint, data]) => ({
      endpoint,
      ...data,
    })).sort((a, b) => b.calls - a.calls)

    // Time-series data based on granularity
    let timeSeries: Array<{ label: string; calls: number; avgTime: number; errors: number }> = []

    if (granularity === 'hourly' && period === 'today') {
      // Group by hour for today
      const hours: Record<number, { calls: number; totalTime: number; errors: number }> = {}
      for (let h = 0; h < 24; h++) {
        hours[h] = { calls: 0, totalTime: 0, errors: 0 }
      }
      for (const log of logs) {
        const hour = log.createdAt.getHours()
        hours[hour].calls++
        hours[hour].totalTime += log.responseTime
        if (log.statusCode >= 400) hours[hour].errors++
      }
      timeSeries = Object.entries(hours).map(([h, data]) => ({
        label: `${h.padStart(2, '0')}:00`,
        calls: data.calls,
        avgTime: data.calls > 0 ? Math.round(data.totalTime / data.calls) : 0,
        errors: data.errors,
      }))
    } else {
      // Group by day
      const days: Record<string, { calls: number; totalTime: number; errors: number }> = {}
      const numDays = period === 'month' ? 30 : 7
      for (let d = numDays - 1; d >= 0; d--) {
        const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
        const key = date.toISOString().split('T')[0]
        days[key] = { calls: 0, totalTime: 0, errors: 0 }
      }
      for (const log of logs) {
        const key = log.createdAt.toISOString().split('T')[0]
        if (days[key]) {
          days[key].calls++
          days[key].totalTime += log.responseTime
          if (log.statusCode >= 400) days[key].errors++
        }
      }
      timeSeries = Object.entries(days).map(([date, data]) => ({
        label: date.slice(5), // MM-DD
        calls: data.calls,
        avgTime: data.calls > 0 ? Math.round(data.totalTime / data.calls) : 0,
        errors: data.errors,
      }))
    }

    return NextResponse.json({
      companyId,
      period,
      granularity,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalCalls,
      avgResponseTime,
      errors,
      errorRate: totalCalls > 0 ? Math.round((errors / totalCalls) * 100) / 100 : 0,
      byEndpoint,
      timeSeries,
    })
  })(request)
}
