import { db } from '@/lib/db'

// ============ API USAGE TRACKING ============
// Fire-and-forget logging of API calls per tenant

export interface ApiUsageParams {
  companyId: string
  userId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number // in milliseconds
}

/**
 * Log an API usage entry in a fire-and-forget manner.
 * This function does NOT await the database write to avoid blocking the response.
 *
 * @example
 * // Usage in API route:
 * const start = Date.now()
 * // ... handle request ...
 * logApiUsage({
 *   companyId,
 *   userId,
 *   endpoint: '/api/invoices',
 *   method: 'GET',
 *   statusCode: 200,
 *   responseTime: Date.now() - start,
 * })
 * // Do NOT await logApiUsage
 */
export function logApiUsage(params: ApiUsageParams): void {
  // Fire and forget — don't block the response
  db.apiUsageLog.create({
    data: {
      companyId: params.companyId,
      userId: params.userId || null,
      endpoint: params.endpoint,
      method: params.method,
      statusCode: params.statusCode,
      responseTime: params.responseTime,
    },
  }).catch((error) => {
    // Silently fail — usage tracking should never break API responses
    console.error('[ApiUsageLog] Failed to log:', error)
  })
}
