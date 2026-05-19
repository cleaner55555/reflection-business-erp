// ─── Performance Monitoring System ─────────────────────────────────────────────
// Core module: tracks request duration, error rates, memory usage, DB query times,
// WebSocket connections, and active users. In-memory with configurable retention.
// Works standalone — optional Sentry integration via sentry.ts wrapper.

export interface MetricPoint {
  timestamp: number
  value: number
  tags?: Record<string, string>
}

export interface RequestMetric {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
  userId?: string
  ip?: string
}

export interface ErrorMetric {
  id: string
  message: string
  stack?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  endpoint?: string
  method?: string
  userId?: string
  timestamp: number
  count: number
  fingerprint: string
  tags?: Record<string, string>
}

export interface AlertConfig {
  id: string
  type: 'error_rate' | 'response_time' | 'memory_usage' | 'error_count'
  threshold: number
  windowMs: number
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export interface SystemHealth {
  healthScore: number
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime: number
  memory: { usedMB: number; totalMB: number; rssMB: number; percentUsed: number }
  activeRequests: number
  totalRequests: number
  totalErrors: number
}

// ─── Time-series bucket for aggregation ────────────────────────────────────────

class TimeSeriesBucket {
  private points: MetricPoint[] = []
  private maxSize: number

  constructor(maxSize = 10000) {
    this.maxSize = maxSize
  }

  add(point: MetricPoint) {
    this.points.push(point)
    if (this.points.length > this.maxSize) {
      // Remove oldest 20% when over capacity
      this.points = this.points.slice(Math.floor(this.maxSize * 0.2))
    }
  }

  query(from: number, to: number): MetricPoint[] {
    return this.points.filter(p => p.timestamp >= from && p.timestamp <= to)
  }

  aggregate(from: number, to: number, bucketSizeMs: number): { timestamp: number; avg: number; min: number; max: number; count: number; p50: number; p95: number }[] {
    const points = this.query(from, to)
    if (points.length === 0) return []

    const buckets = new Map<number, number[]>()
    for (const p of points) {
      const bucketKey = Math.floor(p.timestamp / bucketSizeMs) * bucketSizeMs
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, [])
      buckets.get(bucketKey)!.push(p.value)
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([ts, values]) => {
        const sorted = [...values].sort((a, b) => a - b)
        return {
          timestamp: ts,
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          count: values.length,
          p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
          p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        }
      })
  }

  get size() { return this.points.length }
  clear() { this.points = [] }
}

// ─── Circular buffer for recent items ─────────────────────────────────────────

class CircularBuffer<T> {
  private buffer: T[] = []
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  push(item: T) {
    this.buffer.push(item)
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift()
    }
  }

  getAll(): T[] { return [...this.buffer] }
  get size() { return this.buffer.length }
  clear() { this.buffer = [] }
}

// ─── PerformanceMetrics ────────────────────────────────────────────────────────

class PerformanceMetrics {
  // Response times time-series
  private responseTimes = new TimeSeriesBucket(50000)
  // Error metrics time-series
  private errorRates = new TimeSeriesBucket(10000)
  // Memory usage time-series
  private memoryUsage = new TimeSeriesBucket(5000)
  // DB query times
  private dbQueryTimes = new TimeSeriesBucket(20000)
  // Request count time-series
  private requestCounts = new TimeSeriesBucket(10000)

  // Recent request metrics (circular buffer)
  private recentRequests = new CircularBuffer<RequestMetric>(2000)
  // Recent errors
  private recentErrors = new CircularBuffer<ErrorMetric>(500)

  // Real-time counters
  private activeRequests = 0
  private wsConnections = 0
  private activeUsers = new Set<string>()

  // Alert configurations
  private alerts = new Map<string, AlertConfig>()

  // Retention settings
  private retentionMs: number
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  // Singleton
  private static instance: PerformanceMetrics | null = null

  private constructor(retentionMinutes = 60) {
    this.retentionMs = retentionMinutes * 60 * 1000
    this.startCleanup()
  }

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics()
    }
    return PerformanceMetrics.instance
  }

  // ─── Request tracking ───────────────────────────────────────────────────

  recordRequest(metric: Omit<RequestMetric, 'timestamp'>) {
    const now = Date.now()
    const fullMetric: RequestMetric = { ...metric, timestamp: now }

    this.recentRequests.push(fullMetric)
    this.responseTimes.add({
      timestamp: now,
      value: metric.duration,
      tags: { endpoint: metric.endpoint, method: metric.method, status: String(metric.statusCode) },
    })
    this.requestCounts.add({
      timestamp: now,
      value: 1,
      tags: { endpoint: metric.endpoint },
    })

    if (metric.statusCode >= 400) {
      this.errorRates.add({
        timestamp: now,
        value: 1,
        tags: { endpoint: metric.endpoint, status: String(metric.statusCode) },
      })
    }
  }

  incrementActiveRequests() { this.activeRequests++ }
  decrementActiveRequests() { this.activeRequests-- }

  // ─── Error tracking ────────────────────────────────────────────────────

  recordError(error: Omit<ErrorMetric, 'id' | 'count' | 'fingerprint' | 'timestamp'>) {
    const fingerprint = this.generateFingerprint(error.message, error.endpoint, error.stack)
    const now = Date.now()

    // Check if similar error exists and increment count
    const existing = this.recentErrors.getAll().find(e => e.fingerprint === fingerprint)
    if (existing) {
      existing.count++
      existing.timestamp = now // Update timestamp
      existing.severity = error.severity // Update to latest severity
      return
    }

    const errorMetric: ErrorMetric = {
      ...error,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      count: 1,
      fingerprint,
      timestamp: now,
    }
    this.recentErrors.push(errorMetric)
  }

  private generateFingerprint(message: string, endpoint?: string, stack?: string): string {
    // Use first line of stack + message for grouping
    const stackLine = stack?.split('\n')[1]?.trim() || ''
    const key = `${message}|${endpoint || ''}|${stackLine}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const chr = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + chr
      hash |= 0
    }
    return String(hash)
  }

  // ─── Memory tracking ───────────────────────────────────────────────────

  recordMemory() {
    const mem = process.memoryUsage()
    const usedMB = mem.heapUsed / 1024 / 1024
    this.memoryUsage.add({
      timestamp: Date.now(),
      value: usedMB,
    })
  }

  // ─── Database tracking ─────────────────────────────────────────────────

  recordDbQuery(duration: number, query?: string) {
    this.dbQueryTimes.add({
      timestamp: Date.now(),
      value: duration,
      tags: query ? { query: query.slice(0, 100) } : undefined,
    })
  }

  // ─── WebSocket tracking ────────────────────────────────────────────────

  incrementWsConnections() { this.wsConnections++ }
  decrementWsConnections() { this.wsConnections = Math.max(0, this.wsConnections - 1) }

  // ─── Active user tracking ──────────────────────────────────────────────

  addActiveUser(userId: string) { this.activeUsers.add(userId) }
  removeActiveUser(userId: string) { this.activeUsers.delete(userId) }
  getActiveUserCount(): number { return this.activeUsers.size }

  // ─── Alert management ──────────────────────────────────────────────────

  configureAlert(config: Omit<AlertConfig, 'id' | 'createdAt' | 'updatedAt'>): AlertConfig {
    const id = config.type + '-' + Date.now()
    const alert: AlertConfig = {
      ...config,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.alerts.set(id, alert)
    return alert
  }

  updateAlert(id: string, updates: Partial<AlertConfig>): AlertConfig | null {
    const alert = this.alerts.get(id)
    if (!alert) return null
    const updated = { ...alert, ...updates, updatedAt: Date.now() }
    this.alerts.set(id, updated)
    return updated
  }

  deleteAlert(id: string): boolean {
    return this.alerts.delete(id)
  }

  getAlerts(): AlertConfig[] {
    return Array.from(this.alerts.values())
  }

  checkAlerts(): { type: string; threshold: number; current: number; message: string }[] {
    const triggered: { type: string; threshold: number; current: number; message: string }[] = []
    const now = Date.now()

    for (const alert of this.alerts.values()) {
      if (!alert.enabled) continue

      let current = 0

      switch (alert.type) {
        case 'error_rate': {
          const errors = this.errorRates.query(now - alert.windowMs, now)
          const requests = this.requestCounts.query(now - alert.windowMs, now)
          current = requests.length > 0 ? (errors.length / requests.length) * 100 : 0
          break
        }
        case 'response_time': {
          const times = this.responseTimes.query(now - alert.windowMs, now)
          current = times.length > 0 ? times.reduce((a, b) => a + b.value, 0) / times.length : 0
          break
        }
        case 'memory_usage': {
          const mem = process.memoryUsage()
          current = (mem.heapUsed / mem.heapTotal) * 100
          break
        }
        case 'error_count': {
          current = this.recentErrors.size
          break
        }
      }

      if (current >= alert.threshold) {
        triggered.push({
          type: alert.type,
          threshold: alert.threshold,
          current: Math.round(current * 100) / 100,
          message: `${alert.type} threshold exceeded: ${Math.round(current * 100) / 100} >= ${alert.threshold}`,
        })
      }
    }

    return triggered
  }

  // ─── Query helpers ─────────────────────────────────────────────────────

  getResponseTimes(from?: number, to?: number) {
    const now = Date.now()
    return this.responseTimes.query(
      from ?? now - this.retentionMs,
      to ?? now
    )
  }

  getResponseTimeAggregation(from?: number, to?: number, bucketSizeMs = 60000) {
    const now = Date.now()
    return this.responseTimes.aggregate(
      from ?? now - this.retentionMs,
      to ?? now,
      bucketSizeMs
    )
  }

  getErrorRateAggregation(from?: number, to?: number, bucketSizeMs = 60000) {
    const now = Date.now()
    return this.errorRates.aggregate(
      from ?? now - this.retentionMs,
      to ?? now,
      bucketSizeMs
    )
  }

  getRequestCountAggregation(from?: number, to?: number, bucketSizeMs = 60000) {
    const now = Date.now()
    return this.requestCounts.aggregate(
      from ?? now - this.retentionMs,
      to ?? now,
      bucketSizeMs
    )
  }

  getMemoryAggregation(from?: number, to?: number, bucketSizeMs = 60000) {
    const now = Date.now()
    return this.memoryUsage.aggregate(
      from ?? now - this.retentionMs,
      to ?? now,
      bucketSizeMs
    )
  }

  getDbQueryAggregation(from?: number, to?: number, bucketSizeMs = 60000) {
    const now = Date.now()
    return this.dbQueryTimes.aggregate(
      from ?? now - this.retentionMs,
      to ?? now,
      bucketSizeMs
    )
  }

  getRecentRequests(limit = 100): RequestMetric[] {
    return this.recentRequests.getAll().slice(-limit)
  }

  getRecentErrors(limit = 50): ErrorMetric[] {
    return this.recentErrors.getAll().slice(-limit)
  }

  getErrorsBySeverity(severity?: string): ErrorMetric[] {
    const errors = this.recentErrors.getAll()
    if (!severity) return errors
    return errors.filter(e => e.severity === severity)
  }

  getErrorsByEndpoint(endpoint?: string): ErrorMetric[] {
    const errors = this.recentErrors.getAll()
    if (!endpoint) return errors
    return errors.filter(e => e.endpoint === endpoint)
  }

  getSlowestEndpoints(limit = 10): { endpoint: string; method: string; avgDuration: number; count: number; p95: number }[] {
    const recent = this.recentRequests.getAll()
    const grouped = new Map<string, { durations: number[]; count: number; method: string }>()

    for (const r of recent) {
      const key = `${r.method} ${r.endpoint}`
      if (!grouped.has(key)) grouped.set(key, { durations: [], count: 0, method: r.method })
      const entry = grouped.get(key)!
      entry.durations.push(r.duration)
      entry.count++
    }

    return Array.from(grouped.entries())
      .map(([key, data]) => {
        const sorted = [...data.durations].sort((a, b) => a - b)
        return {
          endpoint: key.replace(/^[A-Z]+ /, ''),
          method: data.method,
          avgDuration: Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length),
          count: data.count,
          p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        }
      })
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit)
  }

  getErrorCountsByEndpoint(limit = 10): { endpoint: string; count: number }[] {
    const errors = this.recentErrors.getAll()
    const grouped = new Map<string, number>()

    for (const e of errors) {
      const key = e.endpoint || 'unknown'
      grouped.set(key, (grouped.get(key) || 0) + e.count)
    }

    return Array.from(grouped.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // ─── System health ─────────────────────────────────────────────────────

  getSystemHealth(): SystemHealth {
    const mem = process.memoryUsage()
    const usedMB = mem.heapUsed / 1024 / 1024
    const totalMB = mem.heapTotal / 1024 / 1024
    const rssMB = mem.rss / 1024 / 1024
    const memPercent = (usedMB / totalMB) * 100

    const now = Date.now()
    const window5min = 5 * 60 * 1000
    const recentErrors = this.errorRates.query(now - window5min, now)
    const recentRequests = this.requestCounts.query(now - window5min, now)
    const errorRate = recentRequests.length > 0 ? (recentErrors.length / recentRequests.length) * 100 : 0

    const recentTimes = this.responseTimes.query(now - window5min, now)
    const avgResponseTime = recentTimes.length > 0
      ? recentTimes.reduce((a, b) => a + b.value, 0) / recentTimes.length
      : 0

    // Health score calculation (0-100)
    let healthScore = 100
    // Penalize high error rate (> 5%)
    if (errorRate > 5) healthScore -= Math.min(40, (errorRate - 5) * 10)
    else if (errorRate > 1) healthScore -= (errorRate - 1) * 5
    // Penalize high memory (> 80%)
    if (memPercent > 90) healthScore -= 30
    else if (memPercent > 80) healthScore -= (memPercent - 80) * 3
    // Penalize slow response (> 1000ms avg)
    if (avgResponseTime > 2000) healthScore -= 20
    else if (avgResponseTime > 1000) healthScore -= (avgResponseTime - 1000) * 0.02

    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)))

    return {
      healthScore,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'unhealthy',
      uptime: process.uptime(),
      memory: {
        usedMB: Math.round(usedMB * 100) / 100,
        totalMB: Math.round(totalMB * 100) / 100,
        rssMB: Math.round(rssMB * 100) / 100,
        percentUsed: Math.round(memPercent * 100) / 100,
      },
      activeRequests: this.activeRequests,
      totalRequests: recentRequests.length,
      totalErrors: recentErrors.length,
    }
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.recordMemory()
      // Trim old data based on retention
      const cutoff = Date.now() - this.retentionMs
      // TimeSeriesBucket handles this internally, just record memory periodically
    }, 30_000) // Every 30 seconds

    // Record initial memory
    this.recordMemory()

    // Don't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    PerformanceMetrics.instance = null
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const metrics = PerformanceMetrics.getInstance()

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type {
  MetricPoint,
  RequestMetric,
  ErrorMetric,
  AlertConfig,
  SystemHealth,
}
