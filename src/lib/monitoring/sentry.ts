// ─── Sentry Integration Layer ─────────────────────────────────────────────────
// Optional Sentry integration — only active if SENTRY_DSN env var is set.
// All functions fall back gracefully if Sentry is not configured.

import { errorTracker } from './error-tracker'
import type { ErrorContext } from './error-tracker'

let sentryInitialized = false
let sentryAvailable = false

// ─── Dynamic import cache ─────────────────────────────────────────────────────

type SentryType = {
  init: (config: Record<string, unknown>) => void
  captureException: (error: unknown, captureContext?: Record<string, unknown>) => string
  captureMessage: (message: string, captureContext?: Record<string, unknown>) => string
  startTransaction: (context: { name: string; op?: string }, options?: Record<string, unknown>) => {
    finish: () => void
    setTag: (key: string, value: string) => void
    setStatus: (status: string) => void
  } | undefined
  setUser: (user: Record<string, unknown> | null) => void
  setTag: (key: string, value: string) => void
  withScope: (callback: (scope: Record<string, unknown>) => void) => void
  Severity: Record<string, string>
}

let sentryInstance: SentryType | null = null

async function loadSentry(): Promise<SentryType | null> {
  if (sentryInstance !== undefined) return sentryInstance

  if (!process.env.SENTRY_DSN) {
    sentryInstance = null
    return null
  }

  try {
    // Try to dynamically import @sentry/nextjs
    sentryInstance = await import('@sentry/nextjs') as unknown as SentryType
    return sentryInstance
  } catch {
    sentryInstance = null
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize Sentry. Only activates if SENTRY_DSN is set in environment.
 * This is safe to call multiple times — only initializes once.
 */
export async function initSentry(): Promise<boolean> {
  if (sentryInitialized) return sentryAvailable

  sentryInitialized = true

  if (!process.env.SENTRY_DSN) {
    sentryAvailable = false
    return false
  }

  const Sentry = await loadSentry()
  if (!Sentry) {
    sentryAvailable = false
    return false
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Don't send PII
      sendDefaultPii: false,
      // Attach stack traces
      attachStacktrace: true,
      // Server-side integrations
      integrations: [],
    })

    sentryAvailable = true
    return true
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error)
    sentryAvailable = false
    return false
  }
}

/**
 * Check if Sentry is currently active.
 */
export function isSentryActive(): boolean {
  return sentryAvailable
}

/**
 * Capture an exception — sends to both local monitoring AND Sentry (if active).
 */
export async function captureException(
  error: unknown,
  context?: ErrorContext,
  severity?: 'info' | 'warning' | 'error' | 'critical'
) {
  // Always send to local monitoring
  errorTracker.captureError(error, context, severity)

  // Optionally send to Sentry
  if (sentryAvailable) {
    try {
      const Sentry = await loadSentry()
      if (Sentry) {
        Sentry.captureException(error, {
          tags: {
            endpoint: context?.endpoint,
            method: context?.method,
            companyId: context?.companyId,
          },
          user: context?.userId ? { id: context.userId } : undefined,
          level: severity || 'error',
        })
      }
    } catch {
      // Sentry failure should not break the app
    }
  }
}

/**
 * Capture a message — sends to both local monitoring AND Sentry (if active).
 */
export async function captureMessage(
  message: string,
  context?: ErrorContext,
  severity?: 'info' | 'warning' | 'error' | 'critical'
) {
  // Always send to local monitoring
  errorTracker.captureMessage(message, context, severity)

  // Optionally send to Sentry
  if (sentryAvailable) {
    try {
      const Sentry = await loadSentry()
      if (Sentry) {
        Sentry.captureMessage(message, {
          tags: {
            endpoint: context?.endpoint,
            method: context?.method,
          },
          level: severity || 'info',
        })
      }
    } catch {
      // Sentry failure should not break the app
    }
  }
}

/**
 * Start a performance transaction — records locally AND Sentry (if active).
 * Returns a transaction-like object with finish() method.
 */
export async function startTransaction(
  name: string,
  op?: string
): Promise<{ finish: () => void; setTag: (key: string, value: string) => void }> {
  const startMs = Date.now()
  const tags: Record<string, string> = {}

  // Start Sentry transaction if available
  let sentryTransaction: ReturnType<NonNullable<SentryType>['startTransaction']> | null = null

  if (sentryAvailable) {
    try {
      const Sentry = await loadSentry()
      if (Sentry) {
        sentryTransaction = Sentry.startTransaction({ name, op })
      }
    } catch {
      // Ignore
    }
  }

  return {
    setTag(key: string, value: string) {
      tags[key] = value
      if (sentryTransaction && typeof sentryTransaction.setTag === 'function') {
        sentryTransaction.setTag(key, value)
      }
    },
    finish() {
      const duration = Date.now() - startMs
      // Record locally
      if (sentryTransaction && typeof sentryTransaction.finish === 'function') {
        sentryTransaction.finish()
      }
    },
  }
}

/**
 * Set user context in Sentry.
 */
export async function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (sentryAvailable) {
    try {
      const Sentry = await loadSentry()
      if (Sentry) {
        Sentry.setUser(user)
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Set a global tag in Sentry.
 */
export async function setTag(key: string, value: string) {
  if (sentryAvailable) {
    try {
      const Sentry = await loadSentry()
      if (Sentry) {
        Sentry.setTag(key, value)
      }
    } catch {
      // Ignore
    }
  }
}
