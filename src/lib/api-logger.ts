// ─── API Request Logger Middleware ───────────────────────────────────────────
// Utility to wrap API route handlers with request logging

import { logApiRequest } from '@/lib/logger'

type NextHandler = () => Promise<Response>
type RequestInfo = { method: string; url: string }

// Wrap an API handler with timing and logging
export function withLogging(handler: NextHandler, req?: Request): () => Promise<Response> {
  return async () => {
    const start = Date.now()
    try {
      const response = await handler()
      const duration = Date.now() - start
      if (req) {
        const url = new URL(req.url).pathname
        logApiRequest(req.method, url, response.status, duration)
      }
      // Slow request warning
      if (duration > 1000) {
        console.warn(`⚠️ Slow request: ${req?.method} ${new URL(req?.url || '').pathname} took ${duration}ms`)
      }
      return response
    } catch (error) {
      const duration = Date.now() - start
      if (req) {
        const url = new URL(req.url).pathname
        logApiRequest(req.method, url, 500, duration)
      }
      throw error
    }
  }
}
