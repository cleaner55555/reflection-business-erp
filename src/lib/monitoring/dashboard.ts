// ─── Dashboard Data Compiler ──────────────────────────────────────────────────
// Compiles monitoring data for dashboard display: time-series charts,
// system health summary, top errors, slowest endpoints.

import { metrics } from './index'
import { errorTracker } from './error-tracker'

// ─── Dashboard Data Types ─────────────────────────────────────────────────────

export interface DashboardData {
  timestamp: string
  health: {
    score: number
    status: 'healthy' | 'degraded' | 'unhealthy'
    uptime: number
  }
  keyMetrics: {
    requestRate: number
    errorRate: number
    avgResponseTime: number
    p95ResponseTime: number
    activeUsers: number
    wsConnections: number
    memoryUsageMB: number
    memoryUsagePercent: number
  }
  charts: {
    responseTimes: TimeSeriesPoint[]
    errorRates: TimeSeriesPoint[]
    requestCounts: TimeSeriesPoint[]
    memoryUsage: TimeSeriesPoint[]
  }
  topSlowEndpoints: EndpointPerformance[]
  recentErrors: ErrorSummary[]
  errorCountsByEndpoint: { endpoint: string; count: number }[]
  triggeredAlerts: { type: string; threshold: number; current: number; message: string }[]
}

export interface TimeSeriesPoint {
  timestamp: number
  value: number
  label?: string
}

export interface EndpointPerformance {
  endpoint: string
  method: string
  avgDuration: number
  count: number
  p95: number
}

export interface ErrorSummary {
  id: string
  message: string
  severity: string
  endpoint?: string
  count: number
  timestamp: number
}

// ─── Time range presets ───────────────────────────────────────────────────────

export type TimeRange = '5m' | '15m' | '30m' | '1h' | '6h' | '24h'

export function getTimeRangeMs(range: TimeRange): number {
  switch (range) {
    case '5m': return 5 * 60 * 1000
    case '15m': return 15 * 60 * 1000
    case '30m': return 30 * 60 * 1000
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
  }
}

export function getBucketSize(range: TimeRange): number {
  switch (range) {
    case '5m': return 10_000      // 10s buckets
    case '15m': return 30_000     // 30s buckets
    case '30m': return 60_000     // 1m buckets
    case '1h': return 60_000      // 1m buckets
    case '6h': return 300_000     // 5m buckets
    case '24h': return 600_000    // 10m buckets
  }
}

// ─── Dashboard compiler ───────────────────────────────────────────────────────

export function compileDashboard(range: TimeRange = '1h'): DashboardData {
  const now = Date.now()
  const rangeMs = getTimeRangeMs(range)
  const bucketSize = getBucketSize(range)
  const from = now - rangeMs

  // ─── Health ────────────────────────────────────────────────────────────
  const systemHealth = metrics.getSystemHealth()

  // ─── Key Metrics ───────────────────────────────────────────────────────
  const responseTimeAgg = metrics.getResponseTimeAggregation(from, now, bucketSize)
  const errorRateAgg = metrics.getErrorRateAggregation(from, now, bucketSize)
  const requestCountAgg = metrics.getRequestCountAggregation(from, now, bucketSize)

  // Average response time across all buckets
  const allResponseTimes = metrics.getResponseTimes(from, now)
  const avgResponseTime = allResponseTimes.length > 0
    ? Math.round(allResponseTimes.reduce((a, b) => a + b.value, 0) / allResponseTimes.length)
    : 0

  // P95 response time
  const sortedResponseTimes = [...allResponseTimes].sort((a, b) => a.value - b.value)
  const p95ResponseTime = sortedResponseTimes.length > 0
    ? Math.round(sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)]?.value || 0)
    : 0

  // Request rate (requests per minute)
  const totalRequests = requestCountAgg.reduce((a, b) => a + b.count, 0)
  const minutesInRange = rangeMs / 60_000
  const requestRate = Math.round((totalRequests / minutesInRange) * 100) / 100

  // Error rate (%)
  const errorCount = errorRateAgg.reduce((a, b) => a + b.count, 0)
  const errorRate = totalRequests > 0
    ? Math.round((errorCount / totalRequests) * 10000) / 100
    : 0

  // Memory
  const mem = process.memoryUsage()
  const memoryUsageMB = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100
  const memoryUsagePercent = Math.round((mem.heapUsed / mem.heapTotal) * 10000) / 100

  // ─── Charts ────────────────────────────────────────────────────────────
  const responseTimesChart = responseTimeAgg.map(b => ({
    timestamp: b.timestamp,
    value: Math.round(b.avg),
    label: new Date(b.timestamp).toLocaleTimeString(),
  }))

  const errorRatesChart = errorRateAgg.map(b => ({
    timestamp: b.timestamp,
    value: b.count,
    label: new Date(b.timestamp).toLocaleTimeString(),
  }))

  const requestCountsChart = requestCountAgg.map(b => ({
    timestamp: b.timestamp,
    value: b.count,
    label: new Date(b.timestamp).toLocaleTimeString(),
  }))

  const memoryAgg = metrics.getMemoryAggregation(from, now, bucketSize)
  const memoryChart = memoryAgg.map(b => ({
    timestamp: b.timestamp,
    value: Math.round(b.avg * 100) / 100,
    label: new Date(b.timestamp).toLocaleTimeString(),
  }))

  // ─── Top Slow Endpoints ────────────────────────────────────────────────
  const topSlowEndpoints = metrics.getSlowestEndpoints(10)

  // ─── Recent Errors ─────────────────────────────────────────────────────
  const recentErrors = metrics.getRecentErrors(20).map(e => ({
    id: e.id,
    message: e.message,
    severity: e.severity,
    endpoint: e.endpoint,
    count: e.count,
    timestamp: e.timestamp,
  }))

  // ─── Error counts by endpoint ──────────────────────────────────────────
  const errorCountsByEndpoint = metrics.getErrorCountsByEndpoint(10)

  // ─── Triggered Alerts ──────────────────────────────────────────────────
  const triggeredAlerts = metrics.checkAlerts()

  return {
    timestamp: new Date().toISOString(),
    health: {
      score: systemHealth.healthScore,
      status: systemHealth.status,
      uptime: Math.round(systemHealth.uptime),
    },
    keyMetrics: {
      requestRate,
      errorRate,
      avgResponseTime,
      p95ResponseTime,
      activeUsers: metrics.getActiveUserCount(),
      wsConnections: 0, // Updated externally
      memoryUsageMB,
      memoryUsagePercent,
    },
    charts: {
      responseTimes: responseTimesChart,
      errorRates: errorRatesChart,
      requestCounts: requestCountsChart,
      memoryUsage: memoryChart,
    },
    topSlowEndpoints: topSlowEndpoints.map(e => ({
      endpoint: e.endpoint,
      method: e.method,
      avgDuration: e.avgDuration,
      count: e.count,
      p95: e.p95,
    })),
    recentErrors,
    errorCountsByEndpoint,
    triggeredAlerts,
  }
}

// ─── Lightweight metrics summary ──────────────────────────────────────────────

export function getMetricsSummary(type?: 'performance' | 'errors' | 'usage', from?: number, to?: number) {
  const now = Date.now()
  const rangeFrom = from ?? now - 60 * 60 * 1000
  const rangeTo = to ?? now

  const base: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      usedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      totalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
    },
    environment: process.env.NODE_ENV || 'development',
  }

  if (!type || type === 'performance') {
    const agg = metrics.getResponseTimeAggregation(rangeFrom, rangeTo, 300_000)
    base.performance = {
      avgResponseTime: agg.length > 0 ? Math.round(agg[agg.length - 1].avg) : 0,
      p95ResponseTime: agg.length > 0 ? Math.round(agg[agg.length - 1].p95) : 0,
      minResponseTime: agg.length > 0 ? Math.round(agg.reduce((a, b) => a + b.min, 0) / agg.length) : 0,
      maxResponseTime: agg.length > 0 ? Math.round(agg.reduce((a, b) => a + Math.max(a, b.max), 0) / agg.length) : 0,
      slowEndpoints: metrics.getSlowestEndpoints(5),
    }
  }

  if (!type || type === 'errors') {
    base.errors = errorTracker.getErrorStats()
  }

  if (!type || type === 'usage') {
    const reqAgg = metrics.getRequestCountAggregation(rangeFrom, rangeTo, 300_000)
    const totalReqs = reqAgg.reduce((a, b) => a + b.count, 0)
    const minutes = (rangeTo - rangeFrom) / 60_000
    base.usage = {
      totalRequests: totalReqs,
      requestsPerMinute: Math.round((totalReqs / minutes) * 100) / 100,
      activeUsers: metrics.getActiveUserCount(),
    }
  }

  return base
}
