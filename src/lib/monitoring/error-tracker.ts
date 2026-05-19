// ─── Error Tracking Module ────────────────────────────────────────────────────
// Captures errors with full context, groups similar errors, calculates error rates.
// Auto-captures unhandled rejections and uncaught exceptions.

import { metrics, type ErrorMetric } from './index'

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface ErrorContext {
  endpoint?: string
  method?: string
  userId?: string
  companyId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  [key: string]: unknown
}

export interface CapturedError extends ErrorMetric {
  context?: ErrorContext
  environment?: string
  release?: string
}

// ─── Error Tracker ────────────────────────────────────────────────────────────

class ErrorTracker {
  private static instance: ErrorTracker | null = null
  private initialized = false
  private globalHandlersInstalled = false

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  /**
   * Initialize the error tracker — installs global handlers on the server side.
   * Call once at app startup.
   */
  init() {
    if (this.initialized) return
    this.initialized = true

    // Only install global handlers on server side
    if (typeof process !== 'undefined' && typeof process.on === 'function') {
      this.installGlobalHandlers()
    }
  }

  /**
   * Capture an error with full context.
   */
  captureError(
    error: unknown,
    context: ErrorContext = {},
    severity: ErrorSeverity = 'error'
  ): string {
    const message = this.extractMessage(error)
    const stack = this.extractStack(error)

    // Determine severity from error type if not specified
    if (severity === 'error') {
      if (this.isCritical(error)) severity = 'critical'
    }

    metrics.recordError({
      message,
      stack,
      severity,
      endpoint: context.endpoint,
      method: context.method,
      userId: context.userId,
      tags: this.buildTags(context),
    })

    return message
  }

  /**
   * Capture a message (non-error event) as a breadcrumb or info-level event.
   */
  captureMessage(
    message: string,
    context: ErrorContext = {},
    severity: ErrorSeverity = 'info'
  ): void {
    metrics.recordError({
      message,
      severity,
      endpoint: context.endpoint,
      method: context.method,
      userId: context.userId,
      tags: this.buildTags(context),
    })
  }

  /**
   * Get recent errors with optional filters.
   */
  getErrors(options?: {
    severity?: ErrorSeverity
    endpoint?: string
    limit?: number
  }): CapturedError[] {
    const baseLimit = options?.limit ?? 50

    let errors: ErrorMetric[]
    if (options?.severity && options?.endpoint) {
      errors = metrics
        .getErrorsBySeverity(options.severity)
        .filter(e => e.endpoint === options.endpoint)
    } else if (options?.severity) {
      errors = metrics.getErrorsBySeverity(options.severity)
    } else if (options?.endpoint) {
      errors = metrics.getErrorsByEndpoint(options.endpoint)
    } else {
      errors = metrics.getRecentErrors(baseLimit)
    }

    return errors.slice(-baseLimit).map(e => ({
      ...e,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',
    }))
  }

  /**
   * Get error statistics.
   */
  getErrorStats() {
    const errors = metrics.getRecentErrors(500)
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const bySeverity: Record<string, number> = {}
    let totalOccurrences = 0

    for (const e of errors) {
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + e.count
      totalOccurrences += e.count
    }

    const lastHour = errors.filter(e => e.timestamp >= oneHourAgo)
    const lastDay = errors.filter(e => e.timestamp >= oneDayAgo)

    return {
      totalUnique: errors.length,
      totalOccurrences,
      lastHour: lastHour.length,
      lastHourOccurrences: lastHour.reduce((a, e) => a + e.count, 0),
      lastDay: lastDay.length,
      lastDayOccurrences: lastDay.reduce((a, e) => a + e.count, 0),
      bySeverity,
      criticalCount: bySeverity['critical'] || 0,
    }
  }

  /**
   * Get error rate as percentage over a time window.
   */
  getErrorRate(windowMs = 300_000): number {
    const now = Date.now()
    const errors = metrics.errorRates.query(now - windowMs, now)
    const requests = metrics.requestCounts.query(now - windowMs, now)
    if (requests.length === 0) return 0
    return Math.round((errors.length / requests.length) * 10000) / 100
  }

  // ─── Private helpers ───────────────────────────────────────────────────

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return String(error)
  }

  private extractStack(error: unknown): string | undefined {
    if (error instanceof Error) return error.stack
    return undefined
  }

  private isCritical(error: unknown): boolean {
    if (error instanceof Error) {
      const criticalKeywords = [
        'ECONNREFUSED', 'ENOTFOUND', 'ENOMEM', 'FATAL',
        'UnhandledPromiseRejection', 'Maximum call stack',
        'out of memory', 'heap out of memory',
      ]
      const msg = error.message.toLowerCase()
      const stack = (error.stack || '').toLowerCase()
      return criticalKeywords.some(k => msg.includes(k.toLowerCase()) || stack.includes(k.toLowerCase()))
    }
    return false
  }

  private buildTags(context: ErrorContext): Record<string, string> {
    const tags: Record<string, string> = {}
    if (context.companyId) tags.companyId = context.companyId
    if (context.requestId) tags.requestId = context.requestId
    if (context.ip) tags.ip = context.ip
    if (context.userAgent) tags.userAgent = context.userAgent.slice(0, 100)
    return tags
  }

  private installGlobalHandlers() {
    if (this.globalHandlersInstalled) return
    this.globalHandlersInstalled = true

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      this.captureError(reason, {}, 'critical')
    })

    // Uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.captureError(error, {}, 'critical')
    })
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const errorTracker = ErrorTracker.getInstance()
