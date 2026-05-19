// ─── Performance Profiler ─────────────────────────────────────────────────────
// Function execution timing wrapper, DB query timing, API route timing middleware,
// and slow query detection.

import { metrics } from './index'
import { errorTracker } from './error-tracker'

// ─── Configuration ────────────────────────────────────────────────────────────

export interface ProfilerConfig {
  /** Slow query threshold in ms (default: 500) */
  slowQueryThresholdMs: number
  /** Slow request threshold in ms (default: 2000) */
  slowRequestThresholdMs: number
  /** Whether to log slow queries (default: true) */
  logSlowQueries: boolean
  /** Whether to log slow requests (default: true) */
  logSlowRequests: boolean
}

const defaultConfig: ProfilerConfig = {
  slowQueryThresholdMs: 500,
  slowRequestThresholdMs: 2000,
  logSlowQueries: true,
  logSlowRequests: true,
}

let profilerConfig: ProfilerConfig = { ...defaultConfig }

export function configureProfiler(config: Partial<ProfilerConfig>) {
  profilerConfig = { ...profilerConfig, ...config }
}

// ─── Profiling Result ─────────────────────────────────────────────────────────

export interface ProfileResult<T = unknown> {
  result: T
  duration: number
  slow: boolean
}

// ─── Profiler Class ───────────────────────────────────────────────────────────

class Profiler {
  /**
   * Time an async function execution.
   * Records to monitoring system and returns result + duration.
   */
  async profile<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<ProfileResult<T>> {
    const start = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - start
      const slow = duration > profilerConfig.slowQueryThresholdMs

      if (slow && profilerConfig.logSlowQueries) {
        errorTracker.captureMessage(
          `[SLOW] ${name} took ${Math.round(duration)}ms`,
          { endpoint: name },
          'warning'
        )
      }

      return { result, duration, slow }
    } catch (error) {
      const duration = performance.now() - start
      errorTracker.captureError(error, {
        endpoint: name,
        ...context,
      })
      throw error
    }
  }

  /**
   * Time a synchronous function execution.
   */
  profileSync<T>(
    name: string,
    fn: () => T,
    context?: Record<string, unknown>
  ): ProfileResult<T> {
    const start = performance.now()

    try {
      const result = fn()
      const duration = performance.now() - start
      const slow = duration > profilerConfig.slowQueryThresholdMs

      if (slow && profilerConfig.logSlowQueries) {
        errorTracker.captureMessage(
          `[SLOW] ${name} took ${Math.round(duration)}ms`,
          { endpoint: name },
          'warning'
        )
      }

      return { result, duration, slow }
    } catch (error) {
      const duration = performance.now() - start
      errorTracker.captureError(error, {
        endpoint: name,
        ...context,
      })
      throw error
    }
  }

  /**
   * Time a database query.
   * Records to monitoring and optionally warns about slow queries.
   */
  async profileDbQuery<T>(
    queryName: string,
    fn: () => Promise<T>,
    query?: string
  ): Promise<T> {
    const start = performance.now()

    try {
      const result = await fn()
      const durationMs = performance.now() - start

      metrics.recordDbQuery(durationMs, query)

      if (durationMs > profilerConfig.slowQueryThresholdMs && profilerConfig.logSlowQueries) {
        errorTracker.captureMessage(
          `[SLOW-QUERY] ${queryName} took ${Math.round(durationMs)}ms (threshold: ${profilerConfig.slowQueryThresholdMs}ms)`,
          {},
          'warning'
        )
      }

      return result
    } catch (error) {
      const durationMs = performance.now() - start
      metrics.recordDbQuery(durationMs, query)

      errorTracker.captureError(error, {
        endpoint: queryName,
      })
      throw error
    }
  }

  /**
   * Create a simple stopwatch for manual timing.
   */
  createStopwatch(label?: string) {
    const start = performance.now()
    let stopped = false

    return {
      /** Stop the stopwatch and return elapsed ms */
      stop(): number {
        if (stopped) return 0
        stopped = true
        const elapsed = performance.now() - start
        return Math.round(elapsed * 100) / 100
      },
      /** Get current elapsed time without stopping */
      elapsed(): number {
        return Math.round((performance.now() - start) * 100) / 100
      },
      /** Stop and record to DB query metrics */
      stopAsDbQuery(query?: string): number {
        const ms = this.stop()
        metrics.recordDbQuery(ms, query)

        if (ms > profilerConfig.slowQueryThresholdMs && profilerConfig.logSlowQueries) {
          errorTracker.captureMessage(
            `[SLOW-QUERY] ${label || 'unnamed'} took ${ms}ms`,
            {},
            'warning'
          )
        }

        return ms
      },
    }
  }
}

// ─── API Route Timing Helper ──────────────────────────────────────────────────

/**
 * Wrap an API route handler with performance monitoring.
 * Usage in route files:
 *
 *   export const GET = withMonitoring('GET /api/invoices', async (req) => { ... })
 */
export function withMonitoring<T extends unknown[]>(
  routeName: string,
  handler: (...args: T) => Promise<Response>,
  options?: {
    method?: string
    endpoint?: string
    getUserId?: (...args: T) => string | undefined
  }
): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    const start = Date.now()
    metrics.incrementActiveRequests()

    try {
      const response = await handler(...args)
      const duration = Date.now() - start

      metrics.recordRequest({
        endpoint: options?.endpoint || routeName.split(' ').slice(1).join(' ') || routeName,
        method: options?.method || routeName.split(' ')[0] || 'GET',
        statusCode: response.status,
        duration,
        userId: options?.getUserId?.(...args),
      })

      if (duration > profilerConfig.slowRequestThresholdMs && profilerConfig.logSlowRequests) {
        errorTracker.captureMessage(
          `[SLOW-REQUEST] ${routeName} took ${duration}ms (threshold: ${profilerConfig.slowRequestThresholdMs}ms)`,
          { endpoint: options?.endpoint || routeName },
          'warning'
        )
      }

      return response
    } catch (error) {
      const duration = Date.now() - start

      metrics.recordRequest({
        endpoint: options?.endpoint || routeName.split(' ').slice(1).join(' ') || routeName,
        method: options?.method || routeName.split(' ')[0] || 'GET',
        statusCode: 500,
        duration,
        userId: options?.getUserId?.(...args),
      })

      errorTracker.captureError(error, {
        endpoint: options?.endpoint || routeName,
      })

      throw error
    } finally {
      metrics.decrementActiveRequests()
    }
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const profiler = new Profiler()
